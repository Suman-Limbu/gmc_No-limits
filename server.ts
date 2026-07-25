import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Support JSON bodies up to 50MB for multi-image OCR uploads
  app.use(express.json({ limit: '50mb' }));

  // API 1: OCR Scan - Extracts paper details from image(s) and populates specific fields
  app.post('/api/ocr-scan', async (req, res) => {
    try {
      const { imageBase64, mimeType, images } = req.body;

      let imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];

      if (Array.isArray(images) && images.length > 0) {
        imageParts = images
          .map((img: any) => ({
            inlineData: {
              mimeType: img.mimeType || 'image/jpeg',
              data: (img.imageBase64 || img.data || '').replace(/^data:image\/\w+;base64,/, ''),
            },
          }))
          .filter((p) => p.inlineData.data.length > 0);
      } else if (imageBase64) {
        imageParts = [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
        ];
      }

      if (imageParts.length === 0) {
        return res.status(400).json({ error: 'At least one image is required for OCR scanning.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          ...imageParts,
          {
            text: `You are an expert document OCR and exam paper parser.
Analyze all provided exam paper or question sheet image pages (${imageParts.length} page(s)).
Perform optical character recognition (OCR) across all pages and extract all structural fields into a single unified JSON schema.

Required Extractions:
1. School / Institution name
2. Address / Location
3. Exam title (e.g., "Terminal Examination 2081", "Final Examination")
4. Subject (e.g., "Science", "Mathematics", "English", "Social Studies", "Computer Science", "Nepali")
5. Grade / Class (e.g., "Grade 10", "Class 9")
6. Time duration (e.g., "2:15 hrs", "3 Hours")
7. Full Marks (integer number)
8. Pass Marks (integer number)
9. Instructions (e.g., "Attempt all questions.")
10. Question Groups (e.g. "Group A", "Group B", "Section A"):
    - Group Name
    - Group Header/Instruction
    - Questions list across all pages:
      * Question text (in English or original language)
      * Optional Nepali translation or text if present
      * Marks per question
      * Sub-questions array (if parts like a, b, i, ii exist)
      * OR choice question text (if an alternative question is given)
      * Question type (descriptive, true_false, fill_in_blanks, match_following, mcq)

If any field is missing from the images, provide a reasonable default.`,
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              school: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  examTitle: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  grade: { type: Type.STRING },
                  time: { type: Type.STRING },
                  fullMarks: { type: Type.NUMBER },
                  passMarks: { type: Type.NUMBER },
                  instructions: { type: Type.STRING },
                },
                required: ['name', 'subject', 'fullMarks', 'passMarks'],
              },
              groups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          textNepali: { type: Type.STRING },
                          marks: { type: Type.NUMBER },
                          subQuestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          orQuestion: { type: Type.STRING },
                        },
                        required: ['text', 'marks'],
                      },
                    },
                  },
                  required: ['name', 'questions'],
                },
              },
            },
            required: ['school', 'groups'],
          },
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        return res.status(500).json({ error: 'OCR engine returned empty response.' });
      }

      const parsedData = JSON.parse(jsonText);

      // Map parsed response to application ExamPaper schema
      const paper = {
        id: `ocr-${Date.now()}`,
        school: {
          name: parsedData.school?.name || '',
          address: parsedData.school?.address || '',
          examTitle: parsedData.school?.examTitle || '',
          subject: parsedData.school?.subject || 'Science',
          grade: parsedData.school?.grade || '',
          time: parsedData.school?.time || '',
          fullMarks: parsedData.school?.fullMarks || 75,
          passMarks: parsedData.school?.passMarks || 30,
          instructions: parsedData.school?.instructions || 'Attempt all questions.',
          language: 'English',
          showSignatures: false,
        },
        groups: (parsedData.groups || []).map((g: any, gIdx: number) => ({
          id: `g-${Date.now()}-${gIdx}`,
          name: g.name || `Group ${String.fromCharCode(65 + gIdx)}`,
          description: g.description || 'Answer the following questions:',
          marksPerQuestion: g.questions?.[0]?.marks || 2,
          totalGroupMarks: (g.questions || []).reduce(
            (acc: number, q: any) => acc + (q.marks || 0),
            0
          ),
          questions: (g.questions || []).map((q: any, qIdx: number) => ({
            id: `q-${Date.now()}-${gIdx}-${qIdx}`,
            text: q.text || '',
            textNepali: q.textNepali || undefined,
            marks: q.marks || 1,
            subQuestions: q.subQuestions || [],
            orQuestion: q.orQuestion || undefined,
          })),
        })),
      };

      return res.json({ success: true, paper });
    } catch (err: any) {
      console.error('OCR API Error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to process image OCR.',
      });
    }
  });

  // API 2: Generate Questions - Generates questions for a group/topic
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const { subject, grade, groupName, topic, count, language, questionType } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is not configured in environment secrets.',
        });
      }

      const targetCount = Math.max(1, parseInt(count, 10) || 3);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Create EXACTLY ${targetCount} high-quality exam questions for:
- Subject: ${subject || 'Science'}
- Grade/Level: ${grade || 'Grade 10'}
- Group/Section: ${groupName || 'Group A'}
- Specific Topic: ${topic || 'General Syllabus'}
- Language: ${language || 'English'}
- Question Type Preference: ${questionType || 'mixed'}

IMPORTANT: You MUST return EXACTLY ${targetCount} questions in the JSON array, no more and no less.

If Question Type is:
- "true_false": questions should be True/False statements.
- "fill_in_blanks": questions should have blank underscores like "____".
- "match_following": questions should have "matchPairs" with equal length columnA and columnB lists.
- "mcq": questions should have "options" array with 4 multiple choice options.
- "descriptive": standard problem or short answer question.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: 'Question type: descriptive, true_false, fill_in_blanks, match_following, mcq',
                },
                text: { type: Type.STRING, description: 'Question statement or instruction' },
                textNepali: { type: Type.STRING, description: 'Optional Nepali translation' },
                marks: { type: Type.NUMBER, description: 'Question mark allocation' },
                subQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Optional subparts',
                },
                orQuestion: { type: Type.STRING, description: 'Optional alternative OR choice' },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4 choices if type is mcq',
                },
                matchPairs: {
                  type: Type.OBJECT,
                  properties: {
                    columnA: { type: Type.ARRAY, items: { type: Type.STRING } },
                    columnB: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  description: 'Matching columns if type is match_following',
                },
              },
              required: ['text', 'marks'],
            },
          },
        },
      });

      const jsonText = response.text || '[]';
      let questions = JSON.parse(jsonText);

      // Enforce strict count
      if (Array.isArray(questions)) {
        questions = questions.slice(0, targetCount);
      } else {
        questions = [];
      }

      return res.json({ success: true, questions });
    } catch (err: any) {
      console.error('Generate Questions Error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate questions.',
      });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
  });
}

startServer();
