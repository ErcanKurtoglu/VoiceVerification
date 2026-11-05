import { AIService, ChatMessage } from "./interface";

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
      return `Tabii! Örneğin, yeni bir fintech ürünü geliştirirken sektördeki 10 bankacıyla görüşmek istiyorsunuz; randevu almak haftalar sürebiliyor veya gönderdiğiniz yazılı forma sadece 1 kişi yanıt veriyor. Bu soruda tam olarak bu tür tıkanıklıklarınızı merak ediyoruz.`;
    }
    return `Bu soruyla amacımız, '${params.questionTitle}' konusunda geçmişte bizzat karşılaştığınız en büyük engeli veya zaman kaybını öğrenmek. Aklınıza gelen somut bir iş tecrübenizi 1-2 cümleyle sesli veya yazılı paylaşabilirsiniz.`;
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
    const isAudio = Boolean(params.audioBase64);
    const mockTranscript = isAudio
      ? "Kullanıcı ses kaydında sektördeki toplantı planlama zorluklarından ve yazılı anketlere yanıt alamamaktan bahsetti. Asenkron sesli bir çözümün takvim baskısını azaltacağını düşünüyor."
      : (params.userTextResponse || "");

    return {
      transcript: mockTranscript,
      sentiment: "positive",
      summary: "Katılımcı asenkron sesli doğrulama modelinin randevu bulma sorununu çözeceğini belirtti.",
      keyPoints: [
        "Takvim randevuları çok vakit alıyor",
        "Asenkron sesli geri bildirim sürtünmeyi ciddi oranda azaltıyor",
      ],
      isJunk: false,
    };
  }
}
