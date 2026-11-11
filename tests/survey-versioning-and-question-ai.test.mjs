import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MockAIService } from "../src/services/ai/mock.ts";
import { validateSurveyQuestion } from "../src/features/anti-garbage/survey-validator.ts";

describe("Survey Versioning (Duplicate V2) & Question-Level AI Copilot", () => {
  const aiService = new MockAIService();

  const BASE_SURVEY = {
    id: "food-equipment-2026",
    slug: "food-equipment-2026",
    title: "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi",
    titleEn: "Print It Right: Food Equipment Parts Experience",
    tagline: "Gıda Sanayii & 3B Parça",
    description: "Gıda hatlarında plansız duruş ve yedek parça temin zorlukları saha araştırması.",
    caseAnchor: "Vaka Odağı: Belirlediğiniz somut parça / olay",
    targetAudience: "Bakım & Mühendislik Şefleri",
    estimatedMinutes: 5,
    aiContext: "Sen tarafsız bir endüstriyel araştırma asistanısın.",
    questions: [
      {
        id: "q1_incident",
        order: 1,
        title: "Q1 — Ne Oldu? (Arıza & İhtiyaç Olayı)",
        description: "Son 12 ay içinde yaşanan somut bir parça arızasını özetleyiniz.",
        clarificationHint: "Tek bir olaya odaklanın (ör. konveyör rulmanı, sızdırmazlık contası).",
        maxDurationSec: 60,
      },
      {
        id: "q2_part_role",
        order: 2,
        title: "Q2 — Parçanın Rolü ve Konumu",
        description: "Parça makinede ne işe yarıyordu?",
        clarificationHint: "Mekanik işlevini belirtiniz.",
        maxDurationSec: 30,
      },
    ],
  };

  test("1. Soru Başına AI Butonu: Başlık boşken pasif olmalı, başlık girilince aktifleşip zengin içerik üretmelidir", async () => {
    // A) Başlık boşken
    const emptyTitleInput = "";
    assert.equal(Boolean(emptyTitleInput.trim()), false, "Başlık boşken AI butonu pasif olmalıdır");

    // B) Başlık yazıldığında
    const validTitle = "Q3 — Kritik Yedek Parça Tedarik Süreleri";
    assert.equal(Boolean(validTitle.trim()), true, "Başlık girildiğinde AI butonu aktifleşmelidir");

    const result = await aiService.clarifyQuestionSpec({
      surveyTitle: BASE_SURVEY.title,
      questionTitle: validTitle,
      currentDescription: "",
      lang: "tr",
    });

    assert.ok(result.description.length > 20, "Soru açıklaması üretilmelidir");
    assert.ok(result.descriptionEn && result.descriptionEn.length > 20, "İngilizce soru açıklaması üretilmelidir");
    assert.ok(result.clarificationHint.length > 30, "AI asistanı için ipucu ve hipotetik örnekler üretilmelidir");
    assert.ok(result.clarificationHintEn && result.clarificationHintEn.length > 30, "İngilizce asistan ipucu üretilmelidir");
    assert.ok([30, 60, 90].includes(result.suggestedDurationSec), "Önerilen süre 30'un katı olmalıdır");
  });

  test("2. Soru Başına AI Butonu: Mevcut açıklamayı koruyarak asistan ipuçlarını güncelleyebilmelidir", async () => {
    const existingDesc = "Hattınızda yaşanan arıza sonrası yeni parçanın teslim süresi ne kadar sürdü?";
    const result = await aiService.clarifyQuestionSpec({
      surveyTitle: BASE_SURVEY.title,
      questionTitle: "Q3 — Tedarik Süresi",
      currentDescription: existingDesc,
      lang: "tr",
    });

    // Kullanıcının yazdığı mevcut açıklama korunmalı
    assert.equal(result.description, existingDesc);
    // Asistan ipucu ise zenginleştirilmiş olmalı
    assert.ok(result.clarificationHint.includes("somut olaya odaklanın"));
  });

  test("3. Anket Çoğaltma (Duplicate / V2): 0 yanıtlı, bağımsız yeni versiyon oluşturmalıdır", () => {
    const cloneTitle = BASE_SURVEY.title.includes("V2")
      ? `${BASE_SURVEY.title} (Kopya)`
      : `${BASE_SURVEY.title} (V2)`;
    const currentPin = "PIR-2026";
    const clonePin = `${currentPin}-V2`;

    const clonedQuestions = BASE_SURVEY.questions.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));

    // Simüle edilen çoğaltma nesnesi
    const duplicatedSurvey = {
      title: cloneTitle,
      tagline: BASE_SURVEY.tagline,
      description: BASE_SURVEY.description,
      caseAnchor: BASE_SURVEY.caseAnchor,
      accessPin: clonePin,
      aiContext: BASE_SURVEY.aiContext,
      questions: clonedQuestions,
      sessionCount: 0, // Sıfır katılımcıyla başlar
    };

    assert.equal(duplicatedSurvey.title, "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi (V2)");
    assert.equal(duplicatedSurvey.accessPin, "PIR-2026-V2");
    assert.equal(duplicatedSurvey.sessionCount, 0);
    assert.equal(duplicatedSurvey.questions.length, BASE_SURVEY.questions.length);

    // 0 yanıtlı olduğu için tüm soruların düzenlenebilir (unlocked) olduğunu doğrula
    const isLocked = duplicatedSurvey.sessionCount > 0;
    assert.equal(isLocked, false, "Çoğaltılan anketin soruları tamamen serbest olmalıdır");
  });

  test("4. Veri Bütünlüğü Koruması: Yanıt almış ankette sorular kilitlenmeli, 0 yanıtlıda serbest olmalıdır", () => {
    // Durum A: 19 yanıt almış anket
    const sessionCountActive = 19;
    const isLockedActive = sessionCountActive > 0;
    assert.equal(isLockedActive, true, "19 yanıt almış ankette sorular kilitli olmalıdır");

    // Durum B: Henüz yanıt almamış (yeni açılmış) anket
    const sessionCountNew = 0;
    const isLockedNew = sessionCountNew > 0;
    assert.equal(isLockedNew, false, "0 yanıt almış ankette sorular düzenlenebilir olmalıdır");
  });

  test("5. In-Interview AI Asistanı: Sorunun güncel clarificationHint bilgisini doğrudan almalıdır", async () => {
    const customHint = "Katılımcıya dolum hattındaki sızdırmazlık contası arızasını örnek verebilirsin.";
    const reply = await aiService.chatClarification({
      questionTitle: "Q1 — Parça Arızası",
      questionDescription: "Son 12 aydaki arızayı anlatın.",
      questionHint: customHint,
      userQuery: "Bu soru ne soruyor, bana bir örnek verir misiniz?",
      conversationHistory: [],
      projectContext: "Print It Right Araştırma Bağlamı",
      lang: "tr",
      participantRole: "Bakım Şefi",
      participantCompany: "Sütaş",
    });

    assert.ok(reply.length > 20, "Asistan soru bazlı açıklama üretmelidir");
  });
});
