import React, { useState, useRef } from 'react';
import {
  ExamPaper,
  Question,
  QuestionGroup,
  SubjectType,
} from '../types/exam';
import {
  Building2,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  X,
  FileSearch,
} from 'lucide-react';

interface LeftSidebarProps {
  paper: ExamPaper;
  setPaper: React.Dispatch<React.SetStateAction<ExamPaper>>;
  onGenerateAiQuestions: (
    subject: string,
    groupName: string,
    topic: string,
    count: number,
    questionType?: string
  ) => Promise<void>;
  isGeneratingAi: boolean;
  aiError: string | null;
  onOcrScan: (
    imagesPayload: Array<{ imageBase64: string; mimeType: string }> | string,
    singleMimeType?: string
  ) => Promise<void>;
  isScanningOcr: boolean;
  ocrError: string | null;
  ocrSuccessMessage: string | null;
}

interface SelectedImageItem {
  id: string;
  imageBase64: string;
  mimeType: string;
  name: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  paper,
  setPaper,
  onGenerateAiQuestions,
  isGeneratingAi,
  aiError,
  onOcrScan,
  isScanningOcr,
  ocrError,
  ocrSuccessMessage,
}) => {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const [showSchoolDetails, setShowSchoolDetails] = useState<boolean>(true);
  const [showAiSection, setShowAiSection] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Force and Pressure');
  const [aiCount, setAiCount] = useState<number>(3);

  // Multi-Image Upload state
  const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle multi-file selection
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesList: File[] = Array.from(e.target.files);
    if (filesList.length === 0) return;

    filesList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setSelectedImages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              imageBase64: resultStr,
              mimeType: file.type || 'image/jpeg',
              name: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAllImages = () => {
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerOcr = () => {
    if (selectedImages.length > 0) {
      onOcrScan(
        selectedImages.map((img) => ({
          imageBase64: img.imageBase64,
          mimeType: img.mimeType,
        }))
      );
    }
  };

  // Helper to update school info
  const handleSchoolChange = (field: keyof typeof paper.school, value: any) => {
    setPaper((prev) => ({
      ...prev,
      school: {
        ...prev.school,
        [field]: value,
      },
    }));
  };

  // Helper to update a question in a group
  const handleQuestionChange = (
    groupId: string,
    questionId: string,
    field: keyof Question,
    value: any
  ) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          questions: group.questions.map((q) => {
            if (q.id !== questionId) return q;
            return { ...q, [field]: value };
          }),
        };
      }),
    }));
  };

  // Add sub-question
  const handleAddSubQuestion = (groupId: string, questionId: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          questions: group.questions.map((q) => {
            if (q.id !== questionId) return q;
            const currentSub = q.subQuestions || [];
            return {
              ...q,
              subQuestions: [...currentSub, `Sub-question ${currentSub.length + 1}`],
            };
          }),
        };
      }),
    }));
  };

  // Delete sub-question
  const handleDeleteSubQuestion = (
    groupId: string,
    questionId: string,
    subIndex: number
  ) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          questions: group.questions.map((q) => {
            if (q.id !== questionId) return q;
            return {
              ...q,
              subQuestions: (q.subQuestions || []).filter((_, idx) => idx !== subIndex),
            };
          }),
        };
      }),
    }));
  };

  // Add question to a group
  const handleAddQuestion = (groupId: string) => {
    const group = paper.groups.find((g) => g.id === groupId);
    const newId = `q-${Date.now()}`;
    const newQuestion: Question = {
      id: newId,
      text: 'Type question text here...',
      marks: group ? group.marksPerQuestion : 1,
    };

    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          questions: [...g.questions, newQuestion],
        };
      }),
    }));
  };

  // Delete question
  const handleDeleteQuestion = (groupId: string, questionId: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          questions: g.questions.filter((q) => q.id !== questionId),
        };
      }),
    }));
  };

  const [aiQuestionType, setAiQuestionType] = useState<string>('mixed');

  // Delete Group
  const handleDeleteGroup = (groupId: string) => {
    setPaper((prev) => {
      const remainingGroups = prev.groups.filter((g) => g.id !== groupId);
      return {
        ...prev,
        groups: remainingGroups,
      };
    });
    setActiveGroupIndex((prevIdx) => Math.max(0, prevIdx - 1));
  };
  const handleMoveQuestion = (
    groupId: string,
    index: number,
    direction: 'up' | 'down'
  ) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        const questions = [...g.questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= questions.length) return g;

        const temp = questions[index];
        questions[index] = questions[targetIndex];
        questions[targetIndex] = temp;

        return { ...g, questions };
      }),
    }));
  };

  // Add new Question Group
  const handleAddGroup = () => {
    const newGroupId = `group-${Date.now()}`;
    const groupNames = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];
    const name = groupNames[paper.groups.length] || `Group ${paper.groups.length + 1}`;

    const newGroup: QuestionGroup = {
      id: newGroupId,
      name,
      description: 'Answer the following questions:',
      marksPerQuestion: 2,
      totalGroupMarks: 10,
      questions: [],
    };

    setPaper((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
    setActiveGroupIndex(paper.groups.length);
  };

  const currentTotalMarks = paper.groups.reduce(
    (acc, g) => acc + g.questions.reduce((qAcc, q) => qAcc + (q.marks || 0), 0),
    0
  );
  const activeGroup = paper.groups[activeGroupIndex] || paper.groups[0];

  return (
    <aside className="w-full md:w-[420px] lg:w-[450px] h-full border-r border-zinc-200 flex flex-col bg-white shrink-0 font-sans overflow-hidden">
      {/* Editor Main Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* SECTION 1: SMART OCR MULTI-IMAGE UPLOAD CARD */}
        <div className="border border-zinc-300 rounded-lg p-3.5 bg-zinc-50/90 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-zinc-900 text-white rounded flex items-center justify-center shadow-xs">
                <FileSearch className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Smart Multi-Page OCR Scan
              </span>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-200">
              AI Vision
            </span>
          </div>

          <p className="text-[11px] text-zinc-600 leading-snug">
            Upload one or multiple images of an exam paper (e.g. Page 1, Page 2). AI will read all pages together and auto-populate all fields.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelect}
            className="hidden"
          />

          {selectedImages.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-4 border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-white rounded-md text-xs font-semibold text-zinc-700 flex flex-col items-center justify-center space-y-1.5 transition-colors group cursor-pointer"
            >
              <Upload className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              <span className="font-bold text-zinc-800">Select Multiple Exam Images</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                Upload Page 1, Page 2, etc. at once (JPG, PNG, WEBP)
              </span>
            </button>
          ) : (
            <div className="space-y-2.5 bg-white p-3 border border-zinc-200 rounded-md">
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                <span className="text-xs font-bold text-zinc-800">
                  Uploaded Exam Pages ({selectedImages.length})
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-zinc-800 hover:underline"
                  >
                    + Add Page
                  </button>
                  <button
                    onClick={handleClearAllImages}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Thumbnails grid */}
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-zinc-50 rounded border border-zinc-200">
                {selectedImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group/img rounded overflow-hidden border border-zinc-200 bg-white aspect-[3/4]"
                  >
                    <img
                      src={img.imageBase64}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col justify-between p-1">
                      <span className="text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded self-start">
                        Page {idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="p-1 bg-rose-600 text-white rounded-full self-end hover:bg-rose-700"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleTriggerOcr}
                disabled={isScanningOcr}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isScanningOcr ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning {selectedImages.length} Page(s) via OCR...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scan All {selectedImages.length} Page(s) with AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {ocrSuccessMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{ocrSuccessMessage}</span>
            </div>
          )}

          {ocrError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded">
              {ocrError}
            </div>
          )}
        </div>

        {/* SECTION 2: SCHOOL & EXAM HEADER CONFIG (Collapsible & Generous Spacing) */}
        <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-2xs">
          <button
            onClick={() => setShowSchoolDetails(!showSchoolDetails)}
            className="w-full px-4 py-3 flex items-center justify-between bg-zinc-100 hover:bg-zinc-100/80 transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5">
              <Building2 className="w-4 h-4 text-zinc-800" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
                School & Header Fields
              </span>
            </div>
            {showSchoolDetails ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
          </button>

          {showSchoolDetails && (
            <div className="p-4 space-y-4 bg-white border-t border-zinc-200">
              {/* Block 1: School & Institution Info */}
              <div className="space-y-3">
                <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">
                  1. Institution Info
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    School / College Name
                  </label>
                  <input
                    type="text"
                    value={paper.school.name}
                    onChange={(e) => handleSchoolChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                    placeholder="e.g. SHREE JANAHIT SECONDARY SCHOOL"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Address / Location
                    </label>
                    <input
                      type="text"
                      value={paper.school.address}
                      onChange={(e) => handleSchoolChange('address', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                      placeholder="e.g. Lalitpur, Nepal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Established / Estd.
                    </label>
                    <input
                      type="text"
                      value={paper.school.estd || ''}
                      onChange={(e) => handleSchoolChange('estd', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                      placeholder="e.g. 2028 B.S."
                    />
                  </div>
                </div>
              </div>

              {/* Block 2: Examination & Subject */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">
                  2. Examination Details
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={paper.school.examTitle}
                    onChange={(e) => handleSchoolChange('examTitle', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                    placeholder="e.g. First Terminal Examination 2081"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={paper.school.subject}
                      onChange={(e) => handleSchoolChange('subject', e.target.value as SubjectType)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                      placeholder="Science"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Grade / Class
                    </label>
                    <input
                      type="text"
                      value={paper.school.grade}
                      onChange={(e) => handleSchoolChange('grade', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                      placeholder="Grade 10"
                    />
                  </div>
                </div>
              </div>

              {/* Block 3: Time & Marks */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">
                  3. Time & Marks Allocation
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Time
                    </label>
                    <input
                      type="text"
                      value={paper.school.time}
                      onChange={(e) => handleSchoolChange('time', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                      placeholder="2:15 Hours"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Full Marks
                    </label>
                    <input
                      type="number"
                      value={paper.school.fullMarks}
                      onChange={(e) => handleSchoolChange('fullMarks', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Pass Marks
                    </label>
                    <input
                      type="number"
                      value={paper.school.passMarks}
                      onChange={(e) => handleSchoolChange('passMarks', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Block 4: Instructions & Signatures */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 pb-1">
                  4. Instructions & Footer
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Instructions Note
                  </label>
                  <input
                    type="text"
                    value={paper.school.instructions}
                    onChange={(e) => handleSchoolChange('instructions', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all"
                    placeholder="Attempt all questions."
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paper.school.showSignatures || false}
                      onChange={(e) => handleSchoolChange('showSignatures', e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span>Show Signature Lines at Paper Footer</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: QUESTIONS & GROUPS EDITOR */}
        <div className="space-y-3">
          {/* Group Tab Bar */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-[80%]">
              {paper.groups.map((group, idx) => (
                <div key={group.id} className="relative group/tab shrink-0 flex items-center">
                  <button
                    onClick={() => setActiveGroupIndex(idx)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      activeGroupIndex === idx
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {group.name} ({group.questions.length})
                  </button>
                  {paper.groups.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
                      }}
                      className="ml-0.5 p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                      title={`Delete ${group.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddGroup}
              className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md border border-zinc-200 transition-colors"
              title="Add New Group"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Group Content */}
          {activeGroup ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  {activeGroup.name} Configuration
                </span>
                {paper.groups.length > 1 && (
                  <button
                    onClick={() => handleDeleteGroup(activeGroup.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Group</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Group Title
                  </label>
                  <input
                    type="text"
                    value={activeGroup.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setPaper((prev) => ({
                        ...prev,
                        groups: prev.groups.map((g, idx) =>
                          idx === activeGroupIndex ? { ...g, name: newName } : g
                        ),
                      }));
                    }}
                    className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs font-bold text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Instruction Text
                  </label>
                  <input
                    type="text"
                    value={activeGroup.description || ''}
                    onChange={(e) => {
                      const newDesc = e.target.value;
                      setPaper((prev) => ({
                        ...prev,
                        groups: prev.groups.map((g, idx) =>
                          idx === activeGroupIndex ? { ...g, description: newDesc } : g
                        ),
                      }));
                    }}
                    className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs text-zinc-900"
                    placeholder="e.g. Answer all questions:"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 pt-1">
                {activeGroup.questions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="bg-zinc-50 border border-zinc-200 rounded-md p-3 space-y-2 relative group hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-200/80">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0">
                          {qIndex + 1}
                        </span>
                        <select
                          value={q.type || 'descriptive'}
                          onChange={(e) => {
                            const newType = e.target.value as any;
                            handleQuestionChange(activeGroup.id, q.id, 'type', newType);
                            if (newType === 'mcq' && (!q.options || q.options.length === 0)) {
                              handleQuestionChange(activeGroup.id, q.id, 'options', ['Option A', 'Option B', 'Option C', 'Option D']);
                            }
                            if (newType === 'match_following' && !q.matchPairs) {
                              handleQuestionChange(activeGroup.id, q.id, 'matchPairs', {
                                columnA: ['Item 1', 'Item 2', 'Item 3'],
                                columnB: ['Match A', 'Match B', 'Match C'],
                              });
                            }
                          }}
                          className="px-2 py-0.5 bg-white border border-zinc-200 rounded text-[11px] font-semibold text-zinc-800"
                        >
                          <option value="descriptive">Descriptive / Short Answer</option>
                          <option value="true_false">True / False</option>
                          <option value="fill_in_blanks">Fill in Blanks</option>
                          <option value="match_following">Match the Following</option>
                          <option value="mcq">Multiple Choice (MCQ)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(activeGroup.id, q.id)}
                        className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded flex items-center space-x-1 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex-1 space-y-1.5">
                        <textarea
                          value={q.text}
                          onChange={(e) =>
                            handleQuestionChange(activeGroup.id, q.id, 'text', e.target.value)
                          }
                          className="w-full p-2 bg-white border border-zinc-200 rounded text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 resize-y min-h-[46px]"
                          placeholder="Type question text..."
                        />

                        {/* Optional Nepali text */}
                        <input
                          type="text"
                          value={q.textNepali || ''}
                          onChange={(e) =>
                            handleQuestionChange(activeGroup.id, q.id, 'textNepali', e.target.value)
                          }
                          className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-xs text-zinc-700 font-serif"
                          placeholder="Nepali translation (Optional)..."
                        />
                      </div>

                      {/* Marks & Controls */}
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={q.marks || 1}
                            onChange={(e) =>
                              handleQuestionChange(
                                activeGroup.id,
                                q.id,
                                'marks',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-12 px-1 py-1 bg-white border border-zinc-200 rounded text-center text-xs font-bold text-zinc-900"
                          />
                          <span className="text-[10px] text-zinc-500 font-bold">mk</span>
                        </div>

                        <div className="flex items-center space-x-1 pt-1">
                          <button
                            onClick={() => handleMoveQuestion(activeGroup.id, qIndex, 'up')}
                            disabled={qIndex === 0}
                            className="p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveQuestion(activeGroup.id, qIndex, 'down')}
                            disabled={qIndex === activeGroup.questions.length - 1}
                            className="p-1 text-zinc-400 hover:text-zinc-800 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* True / False Indicator */}
                    {q.type === 'true_false' && (
                      <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] font-semibold text-blue-900 flex items-center justify-between">
                        <span>Format: Statement followed by [ True / False ]</span>
                        <span className="font-bold text-blue-700">[ True / False ]</span>
                      </div>
                    )}

                    {/* Fill in Blanks Helper */}
                    {q.type === 'fill_in_blanks' && (
                      <div className="flex items-center justify-between p-1.5 bg-zinc-100 rounded text-[11px] text-zinc-700">
                        <span>Blank Format: Use "_______" in statement</span>
                        <button
                          onClick={() => {
                            handleQuestionChange(activeGroup.id, q.id, 'text', (q.text || '') + ' _______ ');
                          }}
                          className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[10px] font-bold"
                        >
                          + Insert Blank
                        </button>
                      </div>
                    )}

                    {/* MCQ Options Editor */}
                    {(q.type === 'mcq' || (q.options && q.options.length > 0)) && (
                      <div className="p-2 bg-zinc-100 border border-zinc-200 rounded space-y-1.5">
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase">
                          MCQ Options:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(q.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center space-x-1">
                              <span className="text-[10px] font-bold text-zinc-500">
                                ({String.fromCharCode(97 + oIdx)})
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...(q.options || [])];
                                  newOpts[oIdx] = e.target.value;
                                  handleQuestionChange(activeGroup.id, q.id, 'options', newOpts);
                                }}
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match the Following Editor */}
                    {(q.type === 'match_following' || q.matchPairs) && (
                      <div className="p-2 bg-zinc-100 border border-zinc-200 rounded space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase">
                          Match Column Pairs:
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="block text-[10px] font-semibold text-zinc-500 mb-1">Column A</span>
                            {(q.matchPairs?.columnA || []).map((colA, aIdx) => (
                              <input
                                key={aIdx}
                                type="text"
                                value={colA}
                                onChange={(e) => {
                                  const newColA = [...(q.matchPairs?.columnA || [])];
                                  newColA[aIdx] = e.target.value;
                                  handleQuestionChange(activeGroup.id, q.id, 'matchPairs', {
                                    columnA: newColA,
                                    columnB: q.matchPairs?.columnB || [],
                                  });
                                }}
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-xs mb-1"
                              />
                            ))}
                          </div>
                          <div>
                            <span className="block text-[10px] font-semibold text-zinc-500 mb-1">Column B</span>
                            {(q.matchPairs?.columnB || []).map((colB, bIdx) => (
                              <input
                                key={bIdx}
                                type="text"
                                value={colB}
                                onChange={(e) => {
                                  const newColB = [...(q.matchPairs?.columnB || [])];
                                  newColB[bIdx] = e.target.value;
                                  handleQuestionChange(activeGroup.id, q.id, 'matchPairs', {
                                    columnA: q.matchPairs?.columnA || [],
                                    columnB: newColB,
                                  });
                                }}
                                className="w-full px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-xs mb-1"
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const colA = [...(q.matchPairs?.columnA || [])];
                            const colB = [...(q.matchPairs?.columnB || [])];
                            colA.push(`Item ${colA.length + 1}`);
                            colB.push(`Match ${colB.length + 1}`);
                            handleQuestionChange(activeGroup.id, q.id, 'matchPairs', {
                              columnA: colA,
                              columnB: colB,
                            });
                          }}
                          className="text-[10px] font-bold text-zinc-800 hover:underline"
                        >
                          + Add Row Pair
                        </button>
                      </div>
                    )}

                    {/* Sub-questions if any */}
                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="pl-6 space-y-1 border-l-2 border-zinc-200 pt-1">
                        {q.subQuestions.map((sub, sIdx) => (
                          <div key={sIdx} className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono text-zinc-500">
                              ({String.fromCharCode(97 + sIdx)})
                            </span>
                            <input
                              type="text"
                              value={sub}
                              onChange={(e) => {
                                const newSubs = [...(q.subQuestions || [])];
                                newSubs[sIdx] = e.target.value;
                                handleQuestionChange(activeGroup.id, q.id, 'subQuestions', newSubs);
                              }}
                              className="flex-1 px-2 py-0.5 bg-white border border-zinc-200 rounded text-xs text-zinc-800"
                            />
                            <button
                              onClick={() => handleDeleteSubQuestion(activeGroup.id, q.id, sIdx)}
                              className="text-zinc-400 hover:text-rose-600 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sub-question & OR Question Buttons */}
                    <div className="flex items-center space-x-2 text-[10px] pt-1 border-t border-zinc-200/60">
                      <button
                        onClick={() => handleAddSubQuestion(activeGroup.id, q.id)}
                        className="text-zinc-600 hover:text-zinc-900 font-semibold"
                      >
                        + Sub-question (a, b)
                      </button>
                      <span className="text-zinc-300">•</span>
                      <button
                        onClick={() => {
                          const currentOr = q.orQuestion;
                          handleQuestionChange(
                            activeGroup.id,
                            q.id,
                            'orQuestion',
                            currentOr ? undefined : 'Alternative choice text...'
                          );
                        }}
                        className="text-zinc-600 hover:text-zinc-900 font-semibold"
                      >
                        {q.orQuestion ? 'Remove OR Choice' : '+ Add OR Choice'}
                      </button>
                    </div>

                    {q.orQuestion !== undefined && (
                      <div className="mt-1.5 p-2 bg-amber-50/50 border border-amber-200 rounded">
                        <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">
                          OR Choice Question:
                        </label>
                        <input
                          type="text"
                          value={q.orQuestion}
                          onChange={(e) =>
                            handleQuestionChange(activeGroup.id, q.id, 'orQuestion', e.target.value)
                          }
                          className="w-full p-1.5 bg-white border border-amber-200 rounded text-xs text-zinc-900"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Button */}
              <button
                onClick={() => handleAddQuestion(activeGroup.id)}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded shadow-2xs transition-colors flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded text-center text-xs text-zinc-500">
              No question groups available. Click "+" to create a group.
            </div>
          )}
        </div>

        {/* SECTION 4: AI QUESTION GENERATOR */}
        <div className="border border-zinc-200 bg-zinc-50 rounded-lg p-3 space-y-2">
          <button
            onClick={() => setShowAiSection(!showAiSection)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-zinc-700" />
              <span className="text-xs font-bold text-zinc-800">
                AI Question Generator
              </span>
            </div>
            {showAiSection ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>

          {showAiSection && (
            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                  Topic / Concept
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-900"
                  placeholder="e.g. Newton Laws, Algebra, Grammar"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Question Type
                  </label>
                  <select
                    value={aiQuestionType}
                    onChange={(e) => setAiQuestionType(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-zinc-200 rounded text-xs font-semibold text-zinc-800"
                  >
                    <option value="mixed">Mixed / All Types</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="true_false">True / False</option>
                    <option value="fill_in_blanks">Fill in Blanks</option>
                    <option value="match_following">Match Following</option>
                    <option value="mcq">Multiple Choice (MCQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Exact Count
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 5].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setAiCount(cnt)}
                        className={`flex-1 py-1 text-xs font-bold rounded ${
                          aiCount === cnt
                            ? 'bg-zinc-900 text-white'
                            : 'bg-white border border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() =>
                    activeGroup &&
                    (onGenerateAiQuestions as any)(
                      paper.school.subject,
                      activeGroup.name,
                      aiTopic,
                      aiCount,
                      aiQuestionType
                    )
                  }
                  disabled={isGeneratingAi || !activeGroup}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating {aiCount} Questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate {aiCount} Questions</span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded">
                  {aiError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Marks Tally Footer */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs font-semibold text-zinc-700">
        <span>Total Marks Added:</span>
        <span className="font-bold text-zinc-900">
          {currentTotalMarks} / {paper.school.fullMarks}
        </span>
      </div>
    </aside>
  );
};
