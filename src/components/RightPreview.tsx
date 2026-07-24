import React, { useState } from 'react';
import { ExamPaper } from '../types/exam';
import { ZoomIn, ZoomOut, RotateCcw, Printer, Download, FileText, Image, Sparkles } from 'lucide-react';
import { downloadPaperPdf } from '../utils/typstCompiler';

interface RightPreviewProps {
  paper: ExamPaper;
  onDownloadPdf: () => void;
  onPrint: () => void;
}

export const RightPreview: React.FC<RightPreviewProps> = ({
  paper,
  onDownloadPdf,
  onPrint,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const { school, groups } = paper;

  const isBlank = !school.name.trim() && groups.length === 0;

  return (
    <main className="flex-1 h-full bg-[#f4f3f0] p-4 md:p-8 flex flex-col items-center justify-start overflow-y-auto relative font-sans selection:bg-zinc-800 selection:text-white">
      {/* Zoom Toolbar */}
      <div className="sticky top-2 z-10 mb-4 bg-white/90 backdrop-blur border border-zinc-200 px-3 py-1.5 rounded-full shadow-xs flex items-center space-x-3 text-xs font-semibold">
        <span className="text-[11px] text-zinc-500 font-serif italic">A4 Live Document View</span>
        <div className="w-px h-3 bg-zinc-200" />
        <div className="flex items-center space-x-1 text-zinc-600">
          <button
            onClick={() => setZoom((prev) => Math.max(60, prev - 10))}
            className="p-1 hover:bg-zinc-100 rounded text-zinc-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-[11px] font-mono font-bold">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(150, prev + 10))}
            className="p-1 hover:bg-zinc-100 rounded text-zinc-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* PAPER CANVAS */}
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
        }}
        className="transition-transform duration-200 mb-20"
      >
        <div
          id="printable-paper"
          className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-[16mm] text-zinc-900 font-serif flex flex-col justify-between border border-zinc-200 relative transition-all"
        >
          {isBlank ? (
            /* BLANK CANVAS INITIAL STATE */
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-12 text-center my-auto min-h-[250mm] bg-zinc-50/40">
              <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 mb-4 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-zinc-800 mb-1">
                Blank Exam Sheet Canvas
              </h3>
              <p className="text-xs font-sans text-zinc-500 max-w-md leading-relaxed mb-6">
                Your paper preview is empty. Fill in school details on the left, upload an exam paper image for smart OCR extraction, or select a sample preset to begin.
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-sm w-full text-left font-sans text-xs">
                <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
                  <span className="font-bold text-zinc-800 block mb-0.5 flex items-center space-x-1">
                    <Image className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Upload Image OCR</span>
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Scan question sheets and auto-place text into specific fields.
                  </span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs">
                  <span className="font-bold text-zinc-800 block mb-0.5 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Manual Editor</span>
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Add school info, groups, and custom questions directly.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE FILLED PAPER DISPLAY */
            <div>
              {/* HEADER */}
              <div className="text-center relative pb-3">
                {school.logoUrl && (
                  <div className="mb-2 flex justify-center">
                    <img
                      src={school.logoUrl}
                      alt="School Logo"
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                )}
                {school.name && (
                  <h1 className="text-xl font-serif font-bold uppercase tracking-wide text-zinc-950">
                    {school.name}
                  </h1>
                )}
                {school.address && (
                  <p className="text-xs font-serif italic text-zinc-700 mt-0.5">
                    {school.address} {school.estd ? `| ESTD. ${school.estd}` : ''}
                  </p>
                )}
                {school.examTitle && (
                  <div className="mt-2 text-sm font-serif font-bold text-zinc-900 underline decoration-zinc-900 underline-offset-4">
                    {school.examTitle}
                  </div>
                )}
              </div>

              {/* META BAR */}
              <div className="mt-4 pt-2 text-xs font-serif font-bold grid grid-cols-2 gap-y-2 text-zinc-900 border-t border-zinc-200">
                <div>
                  Subject:{' '}
                  <span className="font-normal">
                    {school.subject === 'Custom'
                      ? school.customSubject || 'General'
                      : school.subject}
                  </span>
                </div>
                <div className="text-right">
                  Class / Grade: <span className="font-normal">{school.grade || 'N/A'}</span>
                </div>
                <div>
                  Time: <span className="font-normal">{school.time || 'Standard'}</span>
                </div>
                <div className="text-right">
                  Full Marks: <span className="font-bold">{school.fullMarks}</span> &nbsp;|&nbsp; Pass Marks:{' '}
                  <span className="font-bold">{school.passMarks}</span>
                </div>
              </div>

              {/* DOUBLE RULE */}
              <div className="mt-3 border-t-2 border-zinc-900 pt-0.5">
                <div className="border-t border-zinc-900" />
              </div>

              {/* INSTRUCTIONS */}
              {school.instructions && (
                <div className="mt-3 p-2 bg-zinc-50 border border-zinc-200 rounded text-[11px] font-serif italic text-zinc-800 leading-snug">
                  <strong>Instructions:</strong> {school.instructions}
                </div>
              )}

              {/* GROUPS & QUESTIONS */}
              <div className="mt-5 space-y-5">
                {groups.map((group) => (
                  <div key={group.id} className="space-y-2.5">
                    {/* Group Title */}
                    <div className="border-b border-zinc-900 pb-0.5">
                      <h2 className="text-xs font-serif font-bold italic tracking-wide text-zinc-950">
                        {group.name} {group.description ? `-- ${group.description}` : ''}
                      </h2>
                    </div>

                    {/* Questions */}
                    <div className="space-y-3 text-xs font-serif text-zinc-900 leading-relaxed">
                      {group.questions.map((q, qIdx) => (
                        <div key={q.id} className="grid grid-cols-[20pt_1fr_30pt] gap-1 items-start">
                          <div className="font-bold">{qIdx + 1}.</div>

                          <div className="space-y-1">
                            <p>
                              {q.text}
                              {q.type === 'true_false' && (
                                <span className="ml-2 font-bold text-zinc-800 text-[11px] whitespace-nowrap">
                                  [ True / False ]
                                </span>
                              )}
                            </p>

                            {/* MCQ Options */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 my-1.5 pl-2 text-[11px]">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center space-x-1">
                                    <span className="font-bold">({String.fromCharCode(97 + oIdx)})</span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Match the Following Columns */}
                            {q.matchPairs && (q.matchPairs.columnA?.length > 0 || q.matchPairs.columnB?.length > 0) && (
                              <div className="my-2 border border-zinc-300 rounded overflow-hidden">
                                <div className="grid grid-cols-2 bg-zinc-100 border-b border-zinc-300 font-bold text-[10.5px] p-1.5">
                                  <div>Column A</div>
                                  <div>Column B</div>
                                </div>
                                <div className="p-1.5 space-y-1 text-[11px]">
                                  {Array.from({
                                    length: Math.max(
                                      q.matchPairs.columnA?.length || 0,
                                      q.matchPairs.columnB?.length || 0
                                    ),
                                  }).map((_, mIdx) => (
                                    <div key={mIdx} className="grid grid-cols-2 gap-2">
                                      <div>
                                        {q.matchPairs?.columnA[mIdx] ? (
                                          <span>
                                            <strong className="mr-1">({mIdx + 1})</strong>
                                            {q.matchPairs.columnA[mIdx]}
                                          </span>
                                        ) : null}
                                      </div>
                                      <div>
                                        {q.matchPairs?.columnB[mIdx] ? (
                                          <span>
                                            <strong className="mr-1">({String.fromCharCode(97 + mIdx)})</strong>
                                            {q.matchPairs.columnB[mIdx]}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Nepali text if available */}
                            {q.textNepali && (
                              <p className="text-[11px] text-zinc-700 italic font-serif">
                                {q.textNepali}
                              </p>
                            )}

                            {/* Sub Questions */}
                            {q.subQuestions && q.subQuestions.length > 0 && (
                              <div className="pl-4 space-y-0.5 mt-1 text-[11.5px]">
                                {q.subQuestions.map((sq, sqIdx) => (
                                  <p key={sqIdx}>
                                    <span className="font-bold mr-1">
                                      ({String.fromCharCode(97 + sqIdx)})
                                    </span>
                                    {sq}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* OR Choice */}
                            {q.orQuestion && (
                              <div className="my-1.5 text-center font-bold italic text-zinc-700 text-[11px]">
                                -- OR --
                                <p className="font-normal not-italic text-left text-zinc-900 mt-0.5">
                                  {q.orQuestion}
                                </p>
                              </div>
                            )}

                            {/* Diagram Box */}
                            {q.hasDiagramBox && (
                              <div className="my-2 border border-dashed border-zinc-400 p-3 rounded text-center text-[10px] text-zinc-500 italic bg-zinc-50/50">
                                [ Diagram Box: {q.diagramTitle || 'Space for Diagram'} ]
                              </div>
                            )}
                          </div>

                          <div className="text-right font-bold text-[11px] text-zinc-800">
                            [{q.marks}]
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Signatures */}
              {school.showSignatures && (
                <div className="mt-14 pt-6 grid grid-cols-2 gap-8 text-xs font-serif font-bold text-zinc-900">
                  <div>
                    <div className="w-36 border-b border-zinc-900 mb-1" />
                    <div>{school.teacherSignatureLabel || 'Subject Teacher'}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-36 border-b border-zinc-900 mb-1" />
                    <div>{school.headmasterSignatureLabel || 'Headmaster'}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-8 pt-3 border-t border-zinc-300 text-center text-[11px] text-zinc-600 font-serif italic flex items-center justify-between">
            <span>Best of Luck!</span>
            <span>Page 1 of 1</span>
            <span>Exam Paper Studio</span>
          </div>
        </div>
      </div>
    </main>
  );
};
