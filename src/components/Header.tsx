import React from 'react';
import { Download, Printer, RotateCcw, RefreshCw } from 'lucide-react';
import { SubjectType } from '../types/exam';

interface HeaderProps {
  currentSubject: SubjectType;
  onLoadPreset: (subjectKey: string) => void;
  onClearPaper: () => void;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
  onPrint: () => void;
  isPaperBlank: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSubject,
  onLoadPreset,
  onClearPaper,
  onDownloadPdf,
  isDownloadingPdf = false,
  onPrint,
  isPaperBlank,
}) => {
  return (
    <header className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shrink-0 z-20 font-sans">
      {/* App Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-zinc-900 text-white rounded-lg flex items-center justify-center shadow-xs border border-zinc-800">
          <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="m10 13 2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-serif font-extrabold tracking-tight text-zinc-900 flex items-center gap-1.5 leading-none">
            <span>Smart Paper</span>
            <span className="text-[9px] bg-amber-100 text-amber-900 font-sans font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
              AI Studio
            </span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Exam Creator & Multi-Page OCR
          </p>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="flex items-center space-x-2.5">
        {/* Clear to Blank Button */}
        <button
          onClick={onClearPaper}
          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all flex items-center space-x-1 ${
            isPaperBlank
              ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
          title="Reset paper to blank canvas"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New Blank Paper</span>
        </button>

        <div className="h-4 w-px bg-zinc-200" />

        {/* Load Preset Selector */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-md border border-zinc-200 text-xs">
          <span className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Sample:
          </span>
          <button
            onClick={() => onLoadPreset('science')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              currentSubject === 'Science' && !isPaperBlank
                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Science
          </button>
          <button
            onClick={() => onLoadPreset('mathematics')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              currentSubject === 'Mathematics' && !isPaperBlank
                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Math
          </button>
          <button
            onClick={() => onLoadPreset('english')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              currentSubject === 'English' && !isPaperBlank
                ? 'bg-white text-zinc-900 font-bold shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            English
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-200" />

        {/* Print Button */}
        <button
          onClick={onPrint}
          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
          title="Print Question Paper"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Download PDF Button */}
        <button
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer"
        >
          {isDownloadingPdf ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

