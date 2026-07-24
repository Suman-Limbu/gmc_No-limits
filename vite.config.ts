import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function apiPlugin(): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/generate-questions' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const { subject, grade, groupName, topic, count, difficulty, language } = body;

              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not configured in secrets.' }));
                return;
              }

              const ai = new GoogleGenAI({ apiKey });
              const prompt = `You are an expert Nepalese Curriculum Development Centre (CDC) exam paper setter for Secondary Education Examination (SEE, Grade 9-12).
Create ${count || 4} authentic, high-quality exam questions for:
- Subject: ${subject || 'Science'}
- Grade/Level: ${grade || 'Grade 10 (SEE)'}
- Question Group: ${groupName || "Group 'B' - Short Answer Questions"}
- Specific Topic / Chapter: ${topic || 'General Syllabus'}
- Language: ${language || 'English'}
- Difficulty: ${difficulty || 'Standard SEE Board Pattern'}

Respond ONLY with a valid, strict JSON array without markdown code fences or surrounding text.
JSON structure:
[
  {
    "text": "Question text in ${language || 'English'}",
    "textNepali": "Optional Nepali translation if applicable",
    "marks": 2,
    "subQuestions": ["Optional sub-part (a)", "Optional sub-part (b)"],
    "orQuestion": "Optional alternative OR question if applicable",
    "hasDiagramBox": false,
    "diagramTitle": "Optional diagram name"
  }
]`;

              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { temperature: 0.4 },
              });

              let rawText = response.text || '';
              rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

              const questions = JSON.parse(rawText);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, questions }));
            } catch (err: any) {
              console.error('API Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Failed to generate questions' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
