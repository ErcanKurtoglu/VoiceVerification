export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIService {
  chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
  }): Promise<string>;

  analyzeAudioOrTextResponse(params: {
    questionTitle: string;
    userTextResponse?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<{
    transcript?: string;
    sentiment: "positive" | "neutral" | "negative" | "critical";
    summary: string;
    keyPoints: string[];
    isJunk: boolean;
  }>;
}
