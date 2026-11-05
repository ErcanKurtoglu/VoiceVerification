import { GoogleGenAI } from "@google/genai";
import { AIService, ChatMessage } from "./interface";

export class GeminiAIService implements AIService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
  }): Promise<string> {
    const systemPrompt = `
      ${params.projectContext}

      Şu anda katılımcı şu soruyu yanıtlamaya çalışıyor:
      Soru Başlığı: ${params.questionTitle}
      Soru Açıklaması: ${params.questionDescription}

      Görevin: Katılımcıya sorunun kapsamını, neden bu sorunun sorulduğunu net, samimi, tarafsız ve en fazla 2-3 kısa paragrafta açıklamak. Katılımcının kendi tecrübesine odaklanmasını sağla.
    `;

    const contents = [
      ...params.conversationHistory.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: params.userQuery }],
      },
    ];

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text || "Sorunuzu yanıtlayamadım, lütfen tekrar deneyiniz.";
  }

  async analyzeAudioOrTextResponse(params: {
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
  }> {
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (params.audioBase64 && params.mimeType) {
      parts.push({
        inlineData: {
          mimeType: params.mimeType,
          data: params.audioBase64,
        },
      });
      parts.push({
        text: `Lütfen bu ses kaydını dinle ve "${params.questionTitle}" sorusuna verilen yanıt olarak analiz et.`,
      });
    } else if (params.userTextResponse) {
      parts.push({
        text: `Soru: "${params.questionTitle}"\nKullanıcı Yazılı Yanıtı: "${params.userTextResponse}"`,
      });
    }

    const prompt = `
      Lütfen bu kullanıcı yanıtını analiz et ve aşağıdaki JSON şemasında çıktı ver:
      {
        "transcript": "Ses kaydının tam Türkçe deşifresi (eğer ses yoksa boş string)",
        "sentiment": "positive" | "neutral" | "negative" | "critical",
        "summary": "1-2 cümlelik özeti",
        "keyPoints": ["Önemli acı noktası 1", "Önemli fikir 2"],
        "isJunk": boolean (eğer kayıt sadece anlamsız gürültü, küfür veya rastgele tuş vuruşuysa true, anlamlıysa false)
      }
      Sadece saf JSON formatında cevap ver.
    `;

    parts.push({ text: prompt });

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        transcript: parsed.transcript || "",
        sentiment: parsed.sentiment || "neutral",
        summary: parsed.summary || "Özet çıkarılamadı.",
        keyPoints: parsed.keyPoints || [],
        isJunk: Boolean(parsed.isJunk),
      };
    } catch {
      return {
        transcript: "",
        sentiment: "neutral",
        summary: "Analiz tamamlandı.",
        keyPoints: [],
        isJunk: false,
      };
    }
  }
}
