export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface TranscribeResult {
  transcript: string;
  isJunk: boolean;
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
}
