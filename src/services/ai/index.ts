import { AIService } from "./interface";
import { GeminiAIService } from "./gemini";
import { AzureOpenAIAIService } from "./azure-openai";
import { MockAIService } from "./mock";

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (aiServiceInstance) {
    return aiServiceInstance;
  }

  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4-1-mini";
  const geminiKey = process.env.GEMINI_API_KEY;

  if (azureKey && azureEndpoint) {
    aiServiceInstance = new AzureOpenAIAIService({
      apiKey: azureKey.trim(),
      endpoint: azureEndpoint.trim(),
      deployment: azureDeployment.trim(),
      geminiFallbackKey: geminiKey?.trim(),
    });
  } else if (geminiKey && geminiKey.trim().length > 0) {
    aiServiceInstance = new GeminiAIService(geminiKey.trim());
  } else {
    // API anahtarı girilmediğinde geliştiriciyi uyarıp Mock AI'ı başlatıyoruz
    console.warn(
      "[AI Service] API anahtarı bulunamadı. Akıllı Mock AI servisi devrede."
    );
    aiServiceInstance = new MockAIService();
  }

  return aiServiceInstance;
}
