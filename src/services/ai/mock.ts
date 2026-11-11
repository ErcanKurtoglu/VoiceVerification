import type {
  AIService,
  ChatMessage,
  TranscribeResult,
  GeneratedSurveyResult,
  ClarifyQuestionInput,
  ClarifyQuestionOutput,
} from "./interface.ts";

export class MockAIService implements AIService {
  async chatClarification(params: {
    questionTitle: string;
    questionDescription: string;
    questionHint?: string;
    userQuery: string;
    conversationHistory: ChatMessage[];
    projectContext: string;
    lang?: "tr" | "en";
    participantRole?: string;
    participantCompany?: string;
  }): Promise<string> {
    const q = params.userQuery.toLowerCase();
    const isEn = params.lang === "en" || q.includes("safe") || q.includes("advice") || q.includes("suitability") || q.includes("example") || q.includes("mean");

    // Guardrail: Teknik / Mühendislik / Gıda Güvenliği tavsiyesi taleplerini kesinlikle reddet
    const isTechnicalQuery =
      q.includes("güvenli") ||
      q.includes("uygun") ||
      q.includes("malzeme") ||
      q.includes("tavsiye") ||
      q.includes("öner") ||
      q.includes("mühendis") ||
      q.includes("food-safe") ||
      q.includes("safe") ||
      q.includes("technical advice") ||
      q.includes("safety") ||
      q.includes("suitability");

    if (isTechnicalQuery) {
      if (isEn) {
        return "This survey cannot determine technical suitability or safety. Please consult a qualified professional. I can clarify what the survey question is asking.";
      }
      return "Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği tavsiyesi veremez. Lütfen yetkili bir mühendise veya uzmana danışınız. Yalnızca sorunun anlam ve kapsamını açıklayabilirim.";
    }

    // Guardrail: Terim / Kapsam netleştirmesi (Neutral explanation)
    if (q.includes("ne demek") || q.includes("mean") || q.includes("kapsam") || q.includes("scope")) {
      if (isEn) {
        return `In this question, '${params.questionTitle}' refers to what actually occurred in your own plant experience. An estimate or 'I don't know' is completely fine.`;
      }
      return `Bu soruda '${params.questionTitle}' kapsamı, sahadaki fiili tecrübenizde bizzat yaşanan süreci ifade eder. Tahmin yürütebilir veya bilmiyorsanız 'bilmiyorum' diyebilirsiniz.`;
    }

    if (q.includes("örnek") || q.includes("mesela") || q.includes("example")) {
      if (isEn) {
        return `Sure! For example, when a custom seal or nozzle fails on your packaging line, delivery from OEM might take 3-4 weeks. We want to understand similar downtime costs in your experience.`;
      }
      return `Tabii! Örneğin, gıda dolum hattınızda özel bir silikon conta veya nozul kırıldığında İtalya'dan gelmesi 3-4 hafta sürebiliyor. Bu soruda tesisinizdeki benzer parça bekleme sürelerini ve yarattığı duruş maliyetlerini öğrenmek istiyoruz.`;
    }

    if (isEn) {
      return `With this question, our aim is to understand the biggest hurdle or time loss you personally experienced regarding '${params.questionTitle}'. Feel free to share a concrete experience in 1-2 sentences.`;
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
    const titleEn = isPrintItRight
      ? "Print It Right: Food-Safe 3D Printed Parts Validation"
      : "Customer Discovery & Validation Survey";

    const tagline = isPrintItRight
      ? "AI Destekli Gıda Güvenliğine Uygun Parça Üretimi"
      : "Saha Deneyimi & Problem Doğrulama";
    const taglineEn = isPrintItRight
      ? "A-Side Challenge 2026 • Food-Safe Parts On Demand"
      : "Field Experience & Problem Validation";

    const description = isPrintItRight
      ? "Gıda üretim hatlarında yaşanan plansız duruşlar, sertifikalı 3B parçalar ve satın alma süreçlerini inceleyen keşif araştırması."
      : "Katılımcıların sahadaki somut iş deneyimlerini tarafsız biçimde anlamayı hedefleyen araştırma.";
    const descriptionEn = isPrintItRight
      ? "Exploring unplanned downtime, certified additive parts, and procurement workflows in food production facilities."
      : "Understanding participants' direct operational challenges and equipment bottlenecks.";

    // Guardrail kurallarına göre: Uygunluk (eligibility) ve takip (follow-up) soruları YOK.
    // Süreler kesinlikle 30 saniyenin katları (30, 60, 90, 120, 150, 180).
    const questions = [
      {
        title: "Parça Tedarik Süresi & Plansız Duruş Deneyimi",
        titleEn: "Lead Times & Unplanned Downtime Costs",
        description:
          "Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu kritik bir anı, yaşanan adımları ve OEM teslim süresini anlatabilir misiniz?",
        descriptionEn:
          "Over the past 12 months, can you describe the most critical filling or production line stoppage caused by a single replacement part delay, along with the OEM delivery timeline?",
        clarificationHint:
          "Yurtdışından veya OEM'den haftalarca beklenen özel bir conta, dişli veya nozulu düşünebilirsiniz. O duruş üretimi nasıl etkiledi?",
        clarificationHintEn:
          "Consider custom nozzles, seals, or gears awaited from abroad for weeks. How did that stoppage impact your OEE, factory output, or delivery schedule?",
        maxDurationSec: 90, // :30 increment
      },
      {
        title: "Gıda Güvenliği, Hijyen ve Sertifikasyon Çekinceleri",
        titleEn: "Food Safety & Hygiene Concerns in 3D Printing",
        description:
          "Gıdayla temas eden veya hat üzerinde kritik bir parçayı 3B yazıcıyla üretip takacak olsaydınız, sizi en çok düşündüren hijyen, migrasyon veya denetim riski ne olurdu?",
        descriptionEn:
          "If you were to install a 3D printed food-contact part on your production line, what would be the single biggest technical, microbial, or audit risk keeping you up at night?",
        clarificationHint:
          "CIP kostik yıkaması, buhar sterilizasyonu, gözeneklilik veya gıda denetçisine sunulacak migrasyon sertifikasını düşünebilirsiniz.",
        clarificationHintEn:
          "Consider CIP caustic wash resistance, 120°C steam sterilization, interlayer bacterial harborage, or migration/compliance documentation required by food safety auditors (EU 1935/2004).",
        maxDurationSec: 60, // :00 increment
      },
      {
        title: "Satın Alma Modeli & Tedarikçi Onay Süreci",
        titleEn: "AI-Assisted Replacement & Procurement Model",
        description:
          "Kırılan parçanın yerine 48 saatte sertifikalı teslimat sağlayan bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi prosedürlerinizden daha kolay geçer?",
        descriptionEn:
          "In a service model guaranteeing certified replacement parts within 24-48 hours, which commercial framework passes your company's procurement review more smoothly: 'Per-Part Invoicing' or an 'Annual Line Availability Subscription'?",
        clarificationHint:
          "Satın alma komitesi limitlerinizi, acil bakım bütçenizi veya onay adımlarını düşünebilirsiniz.",
        clarificationHintEn:
          "Consider your purchasing committee thresholds, emergency maintenance expenditure limits, and the annual cost of unplanned downtime.",
        maxDurationSec: 90, // :30 increment
      },
    ];

    // Katı kural: Toplam süre, dahil edilen soruların konuşma sürelerinin tam aritmetik toplamıdır.
    const totalMaxSpeakingSeconds = questions.reduce((acc, q) => acc + q.maxDurationSec, 0);
    const estimatedMinutes = Math.ceil(totalMaxSpeakingSeconds / 60);

    return {
      title,
      titleEn,
      tagline,
      taglineEn,
      description,
      descriptionEn,
      aiContext: rawPrompt.trim(),
      questions,
      totalMaxSpeakingSeconds,
      estimatedMinutes,
    };
  }

  async clarifyQuestionSpec(params: ClarifyQuestionInput): Promise<ClarifyQuestionOutput> {
    const title = params.questionTitle;
    const cleanDesc = params.currentDescription?.trim();

    return {
      description: cleanDesc
        ? cleanDesc
        : `${title} konusunda sahadaki somut deneyiminizi, sürecin nasıl işlediğini ve karşılaştığınız durumları sade bir dille özetler misiniz?`,
      descriptionEn: `Could you describe your concrete on-site experience, the sequence of events, and any challenges encountered regarding ${title}?`,
      clarificationHint: `Bu soruda tek bir somut olaya odaklanın. Süreçteki rolünüzü, atılan adımları veya karşılaşılan engelleri (ör. parça tespiti, tedarikçi gecikmesi, onay süreçleri) düşünebilirsiniz. Kesin ticari veya gizli detaylar vermenize gerek yoktur.`,
      clarificationHintEn: `Focus on one specific real-world event. Consider the sequence of steps, key roles involved, or operational hurdles (e.g., part identification, vendor lead times, internal approvals). Proprietary serial numbers or confidential details are not needed.`,
      suggestedDurationSec: 60,
    };
  }
}

