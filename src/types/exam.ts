export type SubjectType = 'Science' | 'Mathematics' | 'English' | 'Social Studies' | 'Computer Science' | 'Nepali' | 'Custom';

export type LanguageMode = 'English' | 'Nepali' | 'Bilingual';

export type QuestionType = 'descriptive' | 'true_false' | 'fill_in_blanks' | 'match_following' | 'mcq';

export interface MatchPairs {
  columnA: string[];
  columnB: string[];
}

export interface Question {
  id: string;
  type?: QuestionType;
  text: string;
  textNepali?: string;
  marks: number;
  subQuestions?: string[];
  orQuestion?: string;
  hasDiagramBox?: boolean;
  diagramTitle?: string;
  // Options for MCQ
  options?: string[];
  // Match the following columns
  matchPairs?: MatchPairs;
}

export interface QuestionGroup {
  id: string;
  name: string; // e.g., "Group 'A'"
  description: string; // e.g., "Very Short Answer Questions"
  marksPerQuestion: number;
  totalGroupMarks: number;
  questions: Question[];
}

export interface SchoolInfo {
  name: string;
  address: string;
  estd?: string;
  logoUrl?: string;
  examTitle: string; // e.g., "Terminal Examination 2081"
  subject: SubjectType;
  customSubject?: string;
  grade: string; // e.g., "Grade 10"
  time: string; // e.g., "2:15 hrs"
  fullMarks: number;
  passMarks: number;
  instructions: string;
  language: LanguageMode;
  showSignatures?: boolean;
  teacherSignatureLabel?: string;
  headmasterSignatureLabel?: string;
}

export interface ExamPaper {
  id: string;
  school: SchoolInfo;
  groups: QuestionGroup[];
}
