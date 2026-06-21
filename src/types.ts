export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'fill_blank'
  | 'descriptive'
  | 'matching';

export interface Option {
  id: string;
  text: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: Option[];
  correctAnswer?: string | boolean;
  matchingPairs?: MatchingPair[];
  score: number;
  hint?: string;
}

export interface ExamBank {
  id: string;
  name: string;
  subject: string;
  grade: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  teacherName: string;
  schoolName: string;
  academicYear: string;
  description?: string;
  questions: Question[];
  createdAt: string;
}
