import { InterviewRound, NPC } from './types';

export const NPC_ROSTER: Record<InterviewRound, NPC[]> = {
  [InterviewRound.HR]: [
    {
      id: 'hr_1',
      name: 'Ms. Lan Chi',
      role: 'HR Manager',
      avatar: 'https://picsum.photos/seed/hr1/200/200',
      personality: 'Friendly but observant. Focuses on culture fit and attitude.',
      traits: ['Empathetic', 'Professional', 'Detail-oriented']
    },
    {
      id: 'hr_2',
      name: 'Mr. Tuan Anh',
      role: 'Talent Acquisition',
      avatar: 'https://picsum.photos/seed/hr2/200/200',
      personality: 'Direct and efficient. Focuses on career goals and stability.',
      traits: ['Stern', 'Quick', 'Logical']
    }
  ],
  [InterviewRound.TECHNICAL]: [
    {
      id: 'tech_1',
      name: 'Ms. Thu Ha',
      role: 'Chief Accountant',
      avatar: 'https://picsum.photos/seed/tech1/200/200',
      personality: 'Strict on standards (VAS/IFRS). Checks for technical precision.',
      traits: ['Academic', 'Precise', 'Demanding']
    },
    {
      id: 'tech_2',
      name: 'Mr. Minh Hoang',
      role: 'Senior Auditor',
      avatar: 'https://picsum.photos/seed/tech2/200/200',
      personality: 'Analytical. Likes to ask "Why?". Focuses on logic behind entries.',
      traits: ['Inquisitive', 'Skeptical', 'Sharp']
    }
  ],
  [InterviewRound.SITUATION]: [
    {
      id: 'sit_1',
      name: 'Mr. Kevin Nguyen',
      role: 'CFO',
      avatar: 'https://picsum.photos/seed/sit1/200/200',
      personality: 'Big picture thinker. Focuses on problem solving and business impact.',
      traits: ['Strategic', 'Visionary', 'Pragmatic']
    }
  ]
};

export const ROUND_TITLES: Record<InterviewRound, string> = {
  [InterviewRound.HR]: 'Vòng 1: Nhân sự & Văn hóa',
  [InterviewRound.TECHNICAL]: 'Vòng 2: Chuyên môn Kế toán',
  [InterviewRound.SITUATION]: 'Vòng 3: Xử lý Tình huống',
};

export const QUESTIONS_PER_ROUND = 3;