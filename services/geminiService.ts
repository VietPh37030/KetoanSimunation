import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InterviewRound, UserProfile, Question, Evaluation, ReportData, InterviewItem } from "../types";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type GlobalWithEnv = typeof globalThis & {
  __ENV__?: Record<string, string | undefined>;
  __VITE_API_KEY__?: string;
};

const LOCAL_STORAGE_KEY = 'ketoan_ai_api_key';

const readFromLocalStorage = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const value = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return value || undefined;
  } catch (err) {
    console.warn('Unable to read API key from localStorage', err);
    return undefined;
  }
};

// Helper to safely get API Key in various environments (Vite, CRA, Next.js)
const getApiKey = (): string => {
  try {
    // 1. Vite build-time variables (preferred for client-side bundles)
    const viteKey = (() => {
      try {
        return (import.meta as any)?.env?.VITE_API_KEY as string | undefined;
      } catch {
        return undefined;
      }
    })();
    if (viteKey) return viteKey;

    // 2. Runtime globals injected via script tag (e.g. <script>window.__ENV__</script>)
    const globalEnv = globalThis as GlobalWithEnv;
    const runtimeKey = globalEnv.__VITE_API_KEY__ || globalEnv.__ENV__?.VITE_API_KEY;
    if (runtimeKey) return runtimeKey;

    // 3. Browser localStorage (allow user-provided key after deployment)
    const storedKey = readFromLocalStorage();
    if (storedKey) return storedKey;

    // 4. Standard process.env (during SSR/build or polyfilled at runtime)
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env.VITE_API_KEY ||
        process.env.API_KEY ||
        process.env.REACT_APP_API_KEY ||
        process.env.NEXT_PUBLIC_API_KEY ||
        ''
      );
    }
  } catch (e) {
    console.warn("Error retrieving API key environment variable", e);
  }
  return '';
};

let cachedClient: GoogleGenAI | null = null;
let cachedKey = '';

const getClient = (): GoogleGenAI => {
  const key = getApiKey();
  if (!key) {
    throw new Error("API Key chưa được cấu hình. Vui lòng thêm biến môi trường VITE_API_KEY trên Vercel hoặc nhập trực tiếp trong ứng dụng.");
  }

  if (!cachedClient || cachedKey !== key) {
    cachedClient = new GoogleGenAI({ apiKey: key });
    cachedKey = key;
  }

  return cachedClient;
};

export const configureRuntimeApiKey = (key: string): void => {
  const trimmed = key.trim();
  if (!trimmed) return;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
    } catch (err) {
      console.warn('Unable to persist API key to localStorage', err);
    }
  }

  const globalEnv = globalThis as GlobalWithEnv;
  globalEnv.__VITE_API_KEY__ = trimmed;

  cachedKey = '';
  cachedClient = null;
};

export const clearRuntimeApiKey = (): void => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.warn('Unable to remove API key from localStorage', err);
    }
  }
  const globalEnv = globalThis as GlobalWithEnv;
  delete globalEnv.__VITE_API_KEY__;
  cachedKey = '';
  cachedClient = null;
};

export const isApiKeyConfigured = (): boolean => {
  return Boolean(getApiKey());
};

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to generate schema-based response
async function generateJson<T>(prompt: string, schema: Schema): Promise<T> {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// 1. Generate Questions
export const generateQuestions = async (
  round: InterviewRound,
  userProfile: UserProfile,
  npcPersonality: string
): Promise<Question[]> => {
  const prompt = `
    You are an expert Accounting Interviewer in Vietnam.
    Role: ${round} Interviewer.
    Personality: ${npcPersonality}.
    Candidate: ${userProfile.name}, Level: ${userProfile.experienceLevel}, Target: ${userProfile.targetRole}.
    
    Generate 3 distinct interview questions suitable for this round.
    Language: Vietnamese.
    
    Context:
    - HR: Focus on soft skills, introduction, strengths/weaknesses.
    - TECHNICAL: Focus on Vietnamese Accounting Standards (VAS), tax laws, journal entries.
    - SITUATION: Focus on ethics, conflict resolution, or complex business errors.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        round: { type: Type.STRING },
        text: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
      },
      required: ['id', 'text', 'difficulty'],
    },
  };

  const data = await generateJson<any[]>(prompt, schema);
  
  return data.map((q, index) => ({
    ...q,
    id: `${round}_${Date.now()}_${index}`,
    round: round,
  }));
};

// 2. Evaluate Answer
export const evaluateAnswer = async (
  question: Question,
  answer: string,
  userProfile: UserProfile,
  npcContext?: { name: string; personality: string }
): Promise<Evaluation> => {
  const prompt = `
    Evaluate this answer for an accounting interview in Vietnam.
    Interviewer: ${npcContext?.name || 'Interviewer'}
    Interviewer Personality: ${npcContext?.personality || 'Professional'}
    Question: "${question.text}"
    Candidate Answer: "${answer}"
    Candidate Level: ${userProfile.experienceLevel}
    
    Provide a score (0-10) and detailed feedback in Vietnamese.
    Assess both technical accuracy (accounting logic) and soft skills (clarity, confidence).
    
    Also, determine the Interviewer's emotional reaction (npcEmotion) based on their personality and the quality of the answer.
    Examples of emotion: "Impressed", "Satisfied", "Neutral", "Skeptical", "Disappointed", "Confused", "Happy".
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      feedback: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      betterAnswer: { type: Type.STRING },
      softSkillsScore: { type: Type.NUMBER },
      techSkillsScore: { type: Type.NUMBER },
      npcEmotion: { type: Type.STRING },
    },
    required: ['score', 'feedback', 'strengths', 'weaknesses', 'betterAnswer', 'softSkillsScore', 'techSkillsScore', 'npcEmotion'],
  };

  return await generateJson<Evaluation>(prompt, schema);
};

// 3. Generate Final Report
export const generateReport = async (
  history: InterviewItem[],
  userProfile: UserProfile
): Promise<ReportData> => {
  const historyText = history.map(h => 
    `Q: ${h.question.text}\nA: ${h.userAnswer}\nScore: ${h.evaluation?.score}`
  ).join('\n---\n');

  const prompt = `
    Generate a final interview performance report for ${userProfile.name} (${userProfile.targetRole}).
    History:
    ${historyText}

    Output must be in Vietnamese.
    Calculate average scores.
    Provide a summary paragraph and a list of specific improvement actions.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER },
      roundScores: { 
        type: Type.OBJECT,
        properties: {
          HR: { type: Type.NUMBER },
          TECHNICAL: { type: Type.NUMBER },
          SITUATION: { type: Type.NUMBER }
        }
      },
      softSkillsAverage: { type: Type.NUMBER },
      techSkillsAverage: { type: Type.NUMBER },
      summary: { type: Type.STRING },
      improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['overallScore', 'roundScores', 'softSkillsAverage', 'techSkillsAverage', 'summary', 'improvementPlan'],
  };

  return await generateJson<ReportData>(prompt, schema);
};