import { GoogleGenAI } from "@google/genai";
import { AIService, ChatMessage, TranscribeResult } from "./interface";

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

  async transcribeAudioOrText(params: {
    questionTitle: string;
    userTextResponse?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    // Eğer katılımcı zaten metin olarak yazdıysa doğrudan metni transkript kabul et
    if (params.userTextResponse && !params.audioBase64) {
      return {
        transcript: params.userTextResponse.trim(),
        isJunk: false,
      };
    }

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (params.audioBase64 && params.mimeType) {
      parts.push({
        inlineData: {
          mimeType: params.mimeType,
          data: params.audioBase64,
        },
      });
      parts.push({
        text: `Bu ses kaydını dinle ve katılımcının söylediklerini harfi harfine, hiçbir kelimeyi ve sektörel/teknik terimi atlamadan düzgün noktalama işaretleriyle tam bir Türkçe metne (transcript) dönüştür.`,
      });
    }

    const prompt = `
      Lütfen çıktıyı sadece şu saf JSON formatında ver:
      {
        "transcript": "Ses kaydının eksiksiz tam deşifresi",
        "isJunk": boolean (eğer kayıt sadece anlamsız gürültü, küfür veya fısıltı ise true, anlamlı bir konuşma ise false)
      }
    `;

    parts.push({ text: prompt });

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Yüksek doğruluklu deşifre için düşük sıcaklık
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return {
        transcript: parsed.transcript || "",
        isJunk: Boolean(parsed.isJunk),
      };
    } catch {
      return {
        transcript: response.text || "",
        isJunk: false,
      };
    }
  }
}
