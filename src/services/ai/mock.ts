import type { AIService, ChatMessage, TranscribeResult } from "./interface.ts";

export class MockAIService implements AIService {
  async chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
  }): Promise<string> {
    const q = params.userQuery.toLowerCase();
    if (q.includes("örnek") || q.includes("mesela")) {
      return `Tabii! Örneğin, gıda dolum hattınızda özel bir silikon conta veya nozul kırıldığında İtalya'dan gelmesi 3-4 hafta sürebiliyor. Bu soruda tesisinizdeki benzer parça bekleme sürelerini ve yarattığı duruş maliyetlerini öğrenmek istiyoruz.`;
    }
    return `Bu soruyla amacımız, '${params.questionTitle}' konusunda sahada bizzat karşılaştığınız en büyük engeli veya zaman kaybını öğrenmek. Aklınıza gelen somut bir iş tecrübenizi 1-2 cümleyle paylaşabilirsiniz.`;
  }

  async transcribeAudioOrText(params: {
    questionTitle: string;
    userTextResponse?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<TranscribeResult> {
    if (params.userTextResponse) {
      return {
        transcript: params.userTextResponse.trim(),
        isJunk: false,
      };
    }

    // Mock ses transkripti
    return {
      transcript:
        "Tesisimizde özel contaların ve nozulların tedariki yaklaşık 3 haftayı buluyor. Bu süreçte hattın durması günlük ciddi üretim kaybına yol açıyor. Gıdaya uygun sertifikalı 3B parça çözümü olursa duruş maliyetlerimizi ciddi oranda düşürebiliriz.",
      isJunk: false,
    };
  }
}
