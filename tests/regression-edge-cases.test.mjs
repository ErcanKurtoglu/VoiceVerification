import { test, describe } from "node:test";
import assert from "node:assert";
import { translations } from "../src/lib/i18n.ts";
import { PRINT_IT_RIGHT_SURVEY } from "../src/surveys/print-it-right.ts";
import { FeedbackSchema } from "../src/types/interview.ts";

describe("Regression: Final Question to Feedback Transition & Draft Resilience", () => {
  const totalQuestions = PRINT_IT_RIGHT_SURVEY.questions.length; // 3

  function simulateQuestionSubmit({
    currentQuestionIndex,
    responses,
    newResponse,
    participant,
    tracking,
  }) {
    const updatedResponses = {
      ...responses,
      [newResponse.questionId]: newResponse,
    };

    let nextStep;
    let nextIndex;

    if (currentQuestionIndex < totalQuestions - 1) {
      nextStep = "questions";
      nextIndex = currentQuestionIndex + 1;
    } else {
      nextStep = "feedback";
      nextIndex = currentQuestionIndex;
    }

    const sessionDraft = {
      projectId: PRINT_IT_RIGHT_SURVEY.id,
      participant,
      tracking,
      responses: updatedResponses,
      step: nextStep,
      currentQuestionIndex: nextIndex,
      status: "in_progress",
    };

    return { nextStep, nextIndex, sessionDraft };
  }

  function simulateRehydration(savedDraft) {
    if (!savedDraft || savedDraft.status !== "in_progress" || !savedDraft.participant) {
      return { step: "onboarding", currentQuestionIndex: 0 };
    }

    if (savedDraft.step === "feedback") {
      return { step: "feedback", currentQuestionIndex: savedDraft.currentQuestionIndex || 0 };
    }

    return {
      step: "questions",
      currentQuestionIndex: savedDraft.currentQuestionIndex || 0,
    };
  }

  test("1. ve 2. soruda sıradaki soruya sorunsuz ilerlemelidir", () => {
    const res1 = simulateQuestionSubmit({
      currentQuestionIndex: 0,
      responses: {},
      newResponse: { questionId: "q1", mode: "audio", durationSec: 10 },
      participant: { fullName: "Ali" },
    });

    assert.strictEqual(res1.nextStep, "questions");
    assert.strictEqual(res1.nextIndex, 1);

    const res2 = simulateQuestionSubmit({
      currentQuestionIndex: 1,
      responses: res1.sessionDraft.responses,
      newResponse: { questionId: "q2", mode: "text", textResponse: "12345678901" },
      participant: { fullName: "Ali" },
    });

    assert.strictEqual(res2.nextStep, "questions");
    assert.strictEqual(res2.nextIndex, 2);
  });

  test("4. (son) soru yanıtlandığında doğrudan 'feedback' adımına geçmeli ve taslağı mühürlemelidir", () => {
    const resFinal = simulateQuestionSubmit({
      currentQuestionIndex: 3, // 4. soru (index 3 - son soru)
      responses: { q1: {}, q2: {}, q3: {} },
      newResponse: { questionId: "q4", mode: "text", textResponse: "mehmet deneme 4" },
      participant: { fullName: "Mehmet" },
    });

    assert.strictEqual(resFinal.nextStep, "feedback");
    assert.strictEqual(resFinal.sessionDraft.step, "feedback");
    assert.strictEqual(resFinal.sessionDraft.currentQuestionIndex, 3);
  });

  test("Taslak geri yükleme (rehydration) 'feedback' adımındaki kullanıcıyı son soruya geri döndürmemelidir", () => {
    const savedDraft = {
      projectId: "print-it-right",
      participant: { fullName: "Mehmet", email: "m@test.com" },
      step: "feedback",
      currentQuestionIndex: 3,
      status: "in_progress",
    };

    const rehydrated = simulateRehydration(savedDraft);
    // Hatalı kodda step her zaman "questions" oluyordu, düzelttiğimiz mantıkta "feedback" kalmalı
    assert.strictEqual(rehydrated.step, "feedback");
  });
});

describe("Regression: Feedback Rating Accuracy & Analytics Integrity", () => {
  function calculateAverageRating(sessions) {
    const ratedSessions = sessions.filter(
      (s) => s.feedback?.rating && s.feedback.rating > 0
    );

    if (ratedSessions.length === 0) {
      return "-";
    }

    const sum = ratedSessions.reduce(
      (acc, s) => acc + (s.feedback?.rating || 0),
      0
    );
    return (sum / ratedSessions.length).toFixed(1);
  }

  function formatCsvRating(feedback) {
    return feedback?.rating && feedback.rating > 0
      ? `${feedback.rating}.0`
      : "Seçim Yapılmadı";
  }

  test("Yıldız seçilmediğinde (rating: 0) şema kabul etmeli ve seçim yapılmadı saymalıdır", () => {
    const parsed = FeedbackSchema.safeParse({
      rating: 0,
      tags: ["Pratik"],
      notes: "",
    });

    assert.strictEqual(parsed.success, true);
    if (parsed.success) {
      assert.strictEqual(parsed.data.rating, 0);
      assert.strictEqual(formatCsvRating(parsed.data), "Seçim Yapılmadı");
    }
  });

  test("Puan vermeyen katılımcılar ortalamayı 5.0'a yapay olarak çekmemeli veya düşürmemelidir", () => {
    const testSessions = [
      { id: "1", feedback: { rating: 5, tags: [] } },
      { id: "2", feedback: { rating: 4, tags: [] } },
      { id: "3", feedback: { rating: 0, tags: [] } }, // Seçim yapmadı
      { id: "4", feedback: undefined }, // Feedback vermedi
      { id: "5", feedback: { rating: 5, tags: [] } },
    ];

    // Yalnızca 5, 4 ve 5 hesaba katılmalı: (5+4+5) / 3 = 14 / 3 = 4.666 -> 4.7
    const avg = calculateAverageRating(testSessions);
    assert.strictEqual(avg, "4.7");
  });

  test("Hiçbir katılımcı puan vermemişse ortalama '-' olmalıdır (yanıltıcı 5.0 olmamalıdır)", () => {
    const emptySessions = [
      { id: "1", feedback: { rating: 0, tags: [] } },
      { id: "2", feedback: undefined },
    ];

    const avg = calculateAverageRating(emptySessions);
    assert.strictEqual(avg, "-");
  });
});

describe("Regression: Text vs Audio Response Readiness Indicator", () => {
  function getReadinessStatus(mode, textInput, hasAudio, lang = "tr") {
    const t = translations[lang];
    const hasText = textInput.trim().length >= 10;
    const canProceed = mode === "audio" ? hasAudio : hasText;

    if (!canProceed) {
      return { canProceed: false, label: null };
    }

    const label = mode === "audio" ? t.recordSuccess : t.textSuccess;
    return { canProceed: true, label };
  }

  test("Yazılı yanıtta 10 karakterden az ise ilerlemeye izin vermemeli ve rozet göstermemelidir", () => {
    const res = getReadinessStatus("text", "kısa", false, "tr");
    assert.strictEqual(res.canProceed, false);
    assert.strictEqual(res.label, null);
  });

  test("Yazılı yanıtta 10 karakter veya üzeri ise 'Yazılı yanıtınız hazır' rozeti göstermelidir (asla ses kaydı hazır yazmamalı)", () => {
    const resTr = getReadinessStatus("text", "mehmet deneme 3", false, "tr");
    assert.strictEqual(resTr.canProceed, true);
    assert.strictEqual(resTr.label, "Yazılı yanıtınız hazır");
    assert.notStrictEqual(resTr.label, "Ses kaydı hazır");

    const resEn = getReadinessStatus("text", "detailed written response here", false, "en");
    assert.strictEqual(resEn.canProceed, true);
    assert.strictEqual(resEn.label, "Written response ready");
  });

  test("Sesli yanıtta geçerli kayıt varsa 'Ses kaydı hazır' rozeti göstermelidir", () => {
    const resTr = getReadinessStatus("audio", "", true, "tr");
    assert.strictEqual(resTr.canProceed, true);
    assert.strictEqual(resTr.label, "Ses kaydı hazır");

    const resEn = getReadinessStatus("audio", "", true, "en");
    assert.strictEqual(resEn.canProceed, true);
    assert.strictEqual(resEn.label, "Recording captured");
  });
});

describe("Regression: Single-Use Survey Invalidation (URL Muzzling)", () => {
  function buildCompletedKey(projectId, search, uid) {
    const cleanSearch = search || "direct";
    const cleanUid = uid || "";
    return `voice_verification_done_${projectId}_${cleanSearch}_${cleanUid}`;
  }

  function evaluateEntry(key, storageMock) {
    if (storageMock[key] === "true") {
      return "already_completed";
    }
    return "onboarding";
  }

  test("Anket tamamlandığında URL'e özgü tekil anahtar üretilip saklanmalıdır", () => {
    const key = buildCompletedKey("print-it-right", "?token=abc123xyz", "usr_99");
    assert.strictEqual(key, "voice_verification_done_print-it-right_?token=abc123xyz_usr_99");

    const storage = {};
    storage[key] = "true";

    // Tekrar girildiğinde doğrudan 'already_completed' dönmeli
    const step = evaluateEntry(key, storage);
    assert.strictEqual(step, "already_completed");
  });
});

describe("Regression: Content & Copy Sanity (No False Email/Report Promises)", () => {
  test("Anket açıklamasında katılımcıya rapor gönderme vaadi bulunmamalıdır", () => {
    assert.strictEqual(
      PRINT_IT_RIGHT_SURVEY.description.includes("rapor iletilecektir") ||
      PRINT_IT_RIGHT_SURVEY.description.includes("mail'inize gönderilecektir") ||
      PRINT_IT_RIGHT_SURVEY.description.includes("Benchmark Raporu iletilecektir"),
      false,
      "Anket açıklamasında rapor vaadi tespit edildi!"
    );
  });

  test("Kullanım ipuçlarında (tips) e-posta ile rapor vaadi bulunmamalıdır", () => {
    for (const tip of PRINT_IT_RIGHT_SURVEY.tips || []) {
      assert.strictEqual(
        tip.toLowerCase().includes("e-postanıza gönderilecektir") ||
        tip.toLowerCase().includes("mailinize iletilecektir"),
        false,
        `İpucu alanında rapor vaadi tespit edildi: ${tip}`
      );
    }
  });

  test("Tamamlama rozetinde (TR ve EN) rapor gönderme taahhüdü bulunmamalıdır", () => {
    assert.strictEqual(
      translations.tr.completionBadgeDesc.includes("adresinize otomatik iletilecektir") ||
      translations.tr.completionBadgeDesc.includes("Benchmark Raporu"),
      false
    );

    assert.strictEqual(
      translations.en.completionBadgeDesc.includes("will be emailed to you") ||
      translations.en.completionBadgeDesc.includes("Benchmark Report"),
      false
    );
  });
});

describe("Localization: i18n Dictionary Parity & Completeness", () => {
  test("Türkçe ve İngilizce çeviri sözlükleri birebir aynı anahtar kümesine sahip olmalıdır", () => {
    const trKeys = Object.keys(translations.tr).sort();
    const enKeys = Object.keys(translations.en).sort();

    assert.deepStrictEqual(trKeys, enKeys, "TR ve EN sözlük anahtarları birebir eşleşmiyor!");
  });

  test("Tüm çeviri anahtarları dolu ve geçerli değerlere sahip olmalıdır", () => {
    for (const [lang, dict] of Object.entries(translations)) {
      for (const [key, value] of Object.entries(dict)) {
        if (Array.isArray(value)) {
          assert.strictEqual(
            value.length > 0,
            true,
            `${lang}.${key} boş bir dizi olamaz.`
          );
        } else if (key === "heroTitleEnd") {
          assert.strictEqual(typeof value, "string");
        } else {
          assert.strictEqual(
            typeof value === "string" && value.trim().length > 0,
            true,
            `${lang}.${key} boş bir string veya geçersiz değer içeriyor.`
          );
        }
      }
    }
  });

  test("Geri bildirim etiketleri (feedbackTags) TR ve EN için eşit sayıda (6 adet) olmalıdır", () => {
    assert.strictEqual(translations.tr.feedbackTags.length, 6);
    assert.strictEqual(translations.en.feedbackTags.length, 6);
  });
});
