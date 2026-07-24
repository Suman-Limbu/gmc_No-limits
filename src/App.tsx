import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightPreview } from './components/RightPreview';
import { EMPTY_EXAM_PAPER, SAMPLE_EXAM_PAPERS } from './data/sampleQuestions';
import { ExamPaper, Question } from './types/exam';
import { downloadPaperPdf } from './utils/typstCompiler';

export default function App() {
  // Start with a blank paper canvas as requested
  const [paper, setPaper] = useState<ExamPaper>(EMPTY_EXAM_PAPER);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // OCR state
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState<string | null>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Check if paper is currently blank
  const isPaperBlank = !paper.school.name.trim() && paper.groups.length === 0;

  // Clear paper to blank state
  const handleClearPaper = () => {
    setPaper(JSON.parse(JSON.stringify(EMPTY_EXAM_PAPER)));
    setOcrSuccessMessage(null);
    setOcrError(null);
  };

  // Load Preset Exam Papers
  const handleLoadPreset = (subjectKey: string) => {
    if (SAMPLE_EXAM_PAPERS[subjectKey]) {
      setPaper(JSON.parse(JSON.stringify(SAMPLE_EXAM_PAPERS[subjectKey])));
      setOcrSuccessMessage(null);
      setOcrError(null);
    }
  };

  // OCR Scan API Callback (Supports single image or array of images)
  const handleOcrScan = async (
    imagesPayload: Array<{ imageBase64: string; mimeType: string }> | string,
    singleMimeType?: string
  ) => {
    setIsScanningOcr(true);
    setOcrError(null);
    setOcrSuccessMessage(null);

    try {
      const bodyPayload = Array.isArray(imagesPayload)
        ? { images: imagesPayload }
        : { imageBase64: imagesPayload, mimeType: singleMimeType || 'image/png' };

      const response = await fetch('/api/ocr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract paper details via OCR');
      }

      // Populate extracted paper data directly into specific fields!
      setPaper(data.paper);
      setOcrSuccessMessage(
        Array.isArray(imagesPayload) && imagesPayload.length > 1
          ? `${imagesPayload.length} exam pages scanned successfully! All fields populated below.`
          : 'Exam paper scanned successfully! Specific fields populated below.'
      );
    } catch (err: any) {
      console.error('OCR Scan Error:', err);
      setOcrError(err.message || 'An error occurred during OCR scanning.');
    } finally {
      setIsScanningOcr(false);
    }
  };

  // AI Question Generation Callback
  const handleGenerateAiQuestions = async (
    subject: string,
    groupName: string,
    topic: string,
    count: number,
    questionType?: string
  ) => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          grade: paper.school.grade,
          groupName,
          topic,
          count,
          language: paper.school.language,
          questionType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate questions from AI');
      }

      const rawQuestions = data.questions || [];
      const generatedQuestions: Question[] = rawQuestions.map((q: any, idx: number) => ({
        id: `ai-q-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        type: q.type || (questionType as any) || 'descriptive',
        text: q.text || 'Generated question',
        textNepali: q.textNepali,
        marks: q.marks || 2,
        subQuestions: q.subQuestions || [],
        orQuestion: q.orQuestion,
        options: q.options || undefined,
        matchPairs: q.matchPairs || undefined,
      }));

      if (generatedQuestions.length === 0) {
        throw new Error('AI returned 0 questions. Please try again.');
      }

      // Immutable & deduplicated update to prevent doubling in React StrictMode
      setPaper((prev) => {
        if (prev.groups.length === 0) {
          return {
            ...prev,
            groups: [
              {
                id: `g-${Date.now()}`,
                name: groupName || 'Group A',
                description: 'Answer the following questions:',
                marksPerQuestion: 2,
                totalGroupMarks: generatedQuestions.reduce((a, b) => a + b.marks, 0),
                questions: generatedQuestions,
              },
            ],
          };
        }

        let targetGroupIndex = prev.groups.findIndex((g) => g.name === groupName);
        if (targetGroupIndex === -1) {
          targetGroupIndex = 0;
        }

        return {
          ...prev,
          groups: prev.groups.map((group, idx) => {
            if (idx !== targetGroupIndex) return group;

            const existingTexts = new Set(
              group.questions.map((q) => q.text.trim().toLowerCase())
            );
            const freshQuestions = generatedQuestions.filter(
              (q) => !existingTexts.has(q.text.trim().toLowerCase())
            );

            // Fallback: if all generated questions were filtered out, force append
            const questionsToAdd =
              freshQuestions.length > 0 ? freshQuestions : generatedQuestions;

            return {
              ...group,
              questions: [...group.questions, ...questionsToAdd],
            };
          }),
        };
      });
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      setAiError(err.message || 'An error occurred while generating questions.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const filename = paper.school.name
        ? `${paper.school.name}_Exam_Paper`
        : 'Exam_Paper';
      await downloadPaperPdf(paper, filename);
    } catch (err) {
      console.error('Error in handleDownloadPdf:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fcfbf9] text-zinc-900 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <Header
        currentSubject={paper.school.subject}
        onLoadPreset={handleLoadPreset}
        onClearPaper={handleClearPaper}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        onPrint={handlePrint}
        isPaperBlank={isPaperBlank}
      />

      {/* Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Form Editor & OCR Scanner */}
        <LeftSidebar
          paper={paper}
          setPaper={setPaper}
          onGenerateAiQuestions={handleGenerateAiQuestions}
          isGeneratingAi={isGeneratingAi}
          aiError={aiError}
          onOcrScan={handleOcrScan}
          isScanningOcr={isScanningOcr}
          ocrError={ocrError}
          ocrSuccessMessage={ocrSuccessMessage}
        />

        {/* Right Column: Live A4 Document Canvas */}
        <RightPreview
          paper={paper}
          onDownloadPdf={handleDownloadPdf}
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
}
