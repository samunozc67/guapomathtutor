export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'teacher' | 'student';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: 7 | 8;
  course: string; // e.g. "7th Math Period 2"
  sessionCounts: Record<string, number>; // subject -> count used this week
  createdAt: Date;
}

export interface Problem {
  id: string;
  teks: string;          // e.g. "7.3A"
  grade: 7 | 8;
  subject: string;       // e.g. "Proportional Relationships"
  difficulty: 1 | 2 | 3;
  questionEN: string;
  questionES: string;
  choices?: { label: string; textEN: string; textES: string }[];
  answerKey: string;
  hintEN: string;
  hintES: string;
  solutionStepsEN: string[];
  solutionStepsES: string[];
  imageUrl?: string;
}

export interface SessionRecord {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  teks: string;
  subject: string;
  grade: 7 | 8;
  score: number;        // 0-100
  totalProblems: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  completedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  grade: 7 | 8;
  teacherId: string;
  students: string[]; // student IDs
  weeklySessionLimit: number;
}

export type Lang = 'en' | 'es';
