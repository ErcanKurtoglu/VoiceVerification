export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TranscribeResult {
  transcript: string;
  isJunk: boolean;
}

export interface GeneratedQuestion {
  title: string;
  description: string;
  clarificationHint: string;
  maxDurationSec: number; // 30-second increments (:00 or :30, e.g. 30, 60, 90, 120, 150, 180)
}

export interface GeneratedSurveyResult {
  title: string;
  tagline: string;
  description: string;
  aiContext: string;
  questions: GeneratedQuestion[];
  totalMaxSpeakingSeconds: number; // Exact arithmetic sum of questions' maxDurationSec
  estimatedMinutes: number; // Math.ceil(totalMaxSpeakingSeconds / 60)
}

export interface AIService {
  chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    questionHint?: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
  }): Promise<string>;

  transcribeAudioOrText(params: {
    questionTitle: string;
    userTextResponse?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<TranscribeResult>;

  generateSurveyFromPrompt(rawPrompt: string): Promise<GeneratedSurveyResult>;
}

