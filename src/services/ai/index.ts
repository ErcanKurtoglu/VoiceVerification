import { AIService } from "./interface";
import { GeminiAIService } from "./gemini";
import { MockAIService } from "./mock";

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (aiServiceInstance) {
    return aiServiceInstance;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    aiServiceInstance = new GeminiAIService(apiKey);
  } else {
    // API anahtarı girilmediğinde geliştiriciyi uyarıp Mock AI'ı başlatıyoruz
    console.warn(
      "[AI Service] GEMINI_API_KEY bulunamadı. Akıllı Mock AI servisi devrede."
    );
    aiServiceInstance = new MockAIService();
  }

  return aiServiceInstance;
}
