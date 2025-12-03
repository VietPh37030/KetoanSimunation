export enum AppView {
  LANDING = 'LANDING',
  SETUP = 'SETUP',
  INTERVIEW = 'INTERVIEW',
  REPORT = 'REPORT',
}

export enum InterviewRound {
  HR = 'HR',
  TECHNICAL = 'TECHNICAL',
  SITUATION = 'SITUATION',
}

export interface UserProfile {
  name: string;
  experienceLevel: 'Intern' | 'Fresher' | 'Junior';
  targetRole: string; // e.g., Kế toán thuế, Kế toán tổng hợp
  confidence: number; // 1-10
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string; // Description for AI context
  traits: string[];
}

export interface Question {
  id: string;
  round: InterviewRound;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Evaluation {
  score: number; // 0-10
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  betterAnswer: string; // Sample answer
  softSkillsScore: number;
  techSkillsScore: number;
  npcEmotion: string; // New field for AI generated emotion
}

export interface InterviewItem {
  question: Question;
  userAnswer: string;
  evaluation?: Evaluation;
  npcId: string;
}

export interface ReportData {
  overallScore: number;
  roundScores: Record<InterviewRound, number>;
  softSkillsAverage: number;
  techSkillsAverage: number;
  summary: string;
  improvementPlan: string[];
}