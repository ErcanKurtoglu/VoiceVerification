import type { AIService, ChatMessage, TranscribeResult, GeneratedSurveyResult } from "./interface.ts";

export class MockAIService implements AIService {
  async chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    questionHint?: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
  }): Promise<string> {
    const q = params.userQuery.toLowerCase();

    // Guardrail: Teknik / Mühendislik / Gıda Güvenliği tavsiyesi taleplerini kesinlikle reddet
    const isTechnicalQuery =
      q.includes("güvenli") ||
      q.includes("uygun") ||
      q.includes("malzeme") ||
      q.includes("tavsiye") ||
      q.includes("öner") ||
      q.includes("mühendis") ||
      q.includes("food-safe") ||
      q.includes("technical advice") ||
      q.includes("safety") ||
      q.includes("suitability");

    if (isTechnicalQuery) {
      if (q.includes("safe") || q.includes("advice") || q.includes("suitability")) {
        return "This survey cannot determine technical suitability or safety. Please consult a qualified professional. I can clarify what the survey question is asking.";
      }
      return "Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği tavsiyesi veremez. Lütfen yetkili bir mühendise veya uzmana danışınız. Yalnızca sorunun anlam ve kapsamını açıklayabilirim.";
    }

    // Guardrail: Terim / Kapsam netleştirmesi (Neutral explanation)
    if (q.includes("ne demek") || q.includes("mean") || q.includes("kapsam") || q.includes("scope")) {
      return `Bu soruda '${params.questionTitle}' kapsamı, sahadaki fiili tecrübenizde bizzat yaşanan süreci ifade eder. Tahmin yürütebilir veya bilmiyorsanız 'bilmiyorum' diyebilirsiniz.`;
    }

    if (q.includes("örnek") || q.includes("mesela") || q.includes("example")) {
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

  async generateSurveyFromPrompt(rawPrompt: string): Promise<GeneratedSurveyResult> {
    // Prompt'tan başlık veya anahtar kelime çıkarma
    const isPrintItRight = rawPrompt.toLowerCase().includes("print it right") || rawPrompt.toLowerCase().includes("food-safe");

    const title = isPrintItRight
      ? "Print It Right: Gıdaya Uygun 3B Parça Doğrulama Araştırması"
      : "Sektörel Müşteri Doğrulama Araştırması";

    const tagline = isPrintItRight
      ? "AI Destekli Gıda Güvenliğine Uygun Parça Üretimi"
      : "Saha Deneyimi & Problem Doğrulama";

    const description = isPrintItRight
      ? "Gıda üretim hatlarında yaşanan plansız duruşlar, sertifikalı 3B parçalar ve satın alma süreçlerini inceleyen keşif araştırması."
      : "Katılımcıların sahadaki somut iş deneyimlerini tarafsız biçimde anlamayı hedefleyen araştırma.";

    // Guardrail kurallarına göre: Uygunluk (eligibility) ve takip (follow-up) soruları YOK.
    // Süreler kesinlikle 30 saniyenin katları (30, 60, 90, 120, 150, 180).
    const questions = [
      {
        title: "Parça Tedarik Süresi & Plansız Duruş Deneyimi",
        description:
          "Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu kritik bir anı, yaşanan adımları ve OEM teslim süresini anlatabilir misiniz?",
        clarificationHint:
          "Yurtdışından veya OEM'den haftalarca beklenen özel bir conta, dişli veya nozulu düşünebilirsiniz. O duruş üretimi nasıl etkiledi?",
        maxDurationSec: 90, // :30 increment
      },
      {
        title: "Gıda Güvenliği, Hijyen ve Sertifikasyon Çekinceleri",
        description:
          "Gıdayla temas eden veya hat üzerinde kritik bir parçayı 3B yazıcıyla üretip takacak olsaydınız, sizi en çok düşündüren hijyen, migrasyon veya denetim riski ne olurdu?",
        clarificationHint:
          "CIP kostik yıkaması, buhar sterilizasyonu, gözeneklilik veya gıda denetçisine sunulacak migrasyon sertifikasını düşünebilirsiniz.",
        maxDurationSec: 60, // :00 increment
      },
      {
        title: "Satın Alma Modeli & Tedarikçi Onay Süreci",
        description:
          "Kırılan parçanın yerine 48 saatte sertifikalı teslimat sağlayan bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi prosedürlerinizden daha kolay geçer?",
        clarificationHint:
          "Satın alma komitesi limitlerinizi, acil bakım bütçenizi veya onay adımlarını düşünebilirsiniz.",
        maxDurationSec: 90, // :30 increment
      },
    ];

    // Katı kural: Toplam süre, dahil edilen soruların konuşma sürelerinin tam aritmetik toplamıdır.
    const totalMaxSpeakingSeconds = questions.reduce((acc, q) => acc + q.maxDurationSec, 0);
    const estimatedMinutes = Math.ceil(totalMaxSpeakingSeconds / 60);

    return {
      title,
      tagline,
      description,
      aiContext: rawPrompt.trim(),
      questions,
      totalMaxSpeakingSeconds,
      estimatedMinutes,
    };
  }
}

