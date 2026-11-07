import { test, describe } from "node:test";
import assert from "node:assert";
import { translations, getLocalizedText } from "../src/lib/i18n.ts";
import { PRINT_IT_RIGHT_SURVEY } from "../src/surveys/print-it-right.ts";
import { MockAIService } from "../src/services/ai/mock.ts";

describe("i18n & Bilingual Engine: getLocalizedText Resolver", () => {
  const sampleQuestion = {
    id: "q1",
    order: 1,
    title: "Parça Tedarik Süresi",
    titleEn: "Lead Times & Parts Delivery",
    description: "Tedarik süresini anlatınız.",
    descriptionEn: "Please describe parts delivery timelines.",
    clarificationHint: "Somut örnek verin.",
    clarificationHintEn: "Provide a concrete plant example.",
    maxDurationSec: 90,
  };

  test("lang='en' seçildiğinde ilgili 'En' alanı öncelikli olarak dönmelidir", () => {
    assert.strictEqual(
      getLocalizedText(sampleQuestion, "title", "en"),
      "Lead Times & Parts Delivery"
    );
    assert.strictEqual(
      getLocalizedText(sampleQuestion, "description", "en"),
      "Please describe parts delivery timelines."
    );
    assert.strictEqual(
      getLocalizedText(sampleQuestion, "clarificationHint", "en"),
      "Provide a concrete plant example."
    );
  });

  test("lang='tr' seçildiğinde varsayılan Türkçe alan dönmelidir", () => {
    assert.strictEqual(
      getLocalizedText(sampleQuestion, "title", "tr"),
      "Parça Tedarik Süresi"
    );
    assert.strictEqual(
      getLocalizedText(sampleQuestion, "description", "tr"),
      "Tedarik süresini anlatınız."
    );
  });

  test("İngilizce alan tanımlı olmadığında ('fallback') varsayılan metne düşmelidir", () => {
    const unilingualSurvey = {
      title: "Gıda Güvenliği Anketi",
      description: "Fabrika hijyen denetimi.",
    };

    assert.strictEqual(
      getLocalizedText(unilingualSurvey, "title", "en"),
      "Gıda Güvenliği Anketi",
      "Eğer İngilizce çeviri henüz girilmemişse boş kalmak yerine Türkçe başlık görünmelidir"
    );
    assert.strictEqual(
      getLocalizedText(unilingualSurvey, "description", "en"),
      "Fabrika hijyen denetimi."
    );
  });

  test("Null veya tanımsız nesnelerde hata fırlatmadan boş dize dönmelidir", () => {
    assert.strictEqual(getLocalizedText(null, "title", "en"), "");
    assert.strictEqual(getLocalizedText(undefined, "title", "tr"), "");
  });
});

describe("i18n & Bilingual Engine: Survey Data Model Integrity", () => {
  test("PRINT_IT_RIGHT_SURVEY anketi eksiksiz İngilizce üst bilgilere sahip olmalıdır", () => {
    assert.ok(PRINT_IT_RIGHT_SURVEY.titleEn, "titleEn tanımlı olmalıdır");
    assert.ok(PRINT_IT_RIGHT_SURVEY.titleEn.includes("Print It Right"));
    assert.ok(PRINT_IT_RIGHT_SURVEY.taglineEn, "taglineEn tanımlı olmalıdır");
    assert.ok(PRINT_IT_RIGHT_SURVEY.descriptionEn, "descriptionEn tanımlı olmalıdır");
    assert.ok(PRINT_IT_RIGHT_SURVEY.aiContextEn, "aiContextEn tanımlı olmalıdır");
  });

  test("PRINT_IT_RIGHT_SURVEY içerisindeki tüm soruların İngilizce çevirileri eksiksiz olmalıdır", () => {
    assert.ok(PRINT_IT_RIGHT_SURVEY.questions.length >= 3);
    for (const q of PRINT_IT_RIGHT_SURVEY.questions) {
      assert.ok(q.titleEn && q.titleEn.length > 5, `Soru ${q.id} için titleEn eksik`);
      assert.ok(q.descriptionEn && q.descriptionEn.length > 10, `Soru ${q.id} için descriptionEn eksik`);
      assert.ok(q.clarificationHintEn && q.clarificationHintEn.length > 10, `Soru ${q.id} için clarificationHintEn eksik`);
    }
  });
});

describe("i18n & Bilingual Engine: Translations Dictionary Coverage", () => {
  const requiredKeys = [
    "statsEstimatedMinutes",
    "statsQuestionsCount",
    "statsKvkkBadge",
    "tipsTitle",
    "tipAudioTextTitle",
    "tipAudioTextDesc",
    "tipAiAssistantTitle",
    "tipAiAssistantDesc",
    "tipPreviousTitle",
    "tipPreviousDesc",
    "verifiedInviteTitle",
    "verifiedInviteEditBtn",
    "maxDurationPrefix",
    "micPromptInitial",
    "micAriaStart",
    "micAriaStop",
    "assistantDrawerTitle",
    "assistantDrawerSubtitle",
    "assistantQuickPrompts",
    "assistantErrorDefault",
    "assistantConnectionError",
    "assistantQuotaExceeded",
  ];

  test("Tüm yeni i18n anahtarları TR sözlüğünde eksiksiz mevcut olmalıdır", () => {
    for (const key of requiredKeys) {
      assert.ok(
        translations.tr[key] !== undefined,
        `translations.tr.${key} tanımlı olmalıdır`
      );
    }
    assert.strictEqual(translations.tr.assistantQuickPrompts.length, 3);
    assert.strictEqual(translations.tr.micPromptInitial, "Mikrofona basarak konuşun");
  });

  test("Tüm yeni i18n anahtarları EN sözlüğünde eksiksiz mevcut olmalıdır", () => {
    for (const key of requiredKeys) {
      assert.ok(
        translations.en[key] !== undefined,
        `translations.en.${key} tanımlı olmalıdır`
      );
    }
    assert.strictEqual(translations.en.assistantQuickPrompts.length, 3);
    assert.strictEqual(translations.en.micPromptInitial, "Click microphone to speak");
    assert.strictEqual(translations.en.maxDurationPrefix, "Max");
  });
});

describe("i18n & Bilingual Engine: AI Assistant & Generator Locale Support", () => {
  const ai = new MockAIService();

  test("lang='en' ile soru asistanına danışıldığında İngilizce yanıt dönmelidir", async () => {
    const reply = await ai.chatClarification({
      questionTitle: "Lead Times & Unplanned Downtime Costs",
      questionDescription: "Over the past 12 months, describe critical stoppage.",
      questionHint: "Consider custom nozzles and seals.",
      userQuery: "Can you give me an example?",
      conversationHistory: [],
      projectContext: "Print It Right study",
      lang: "en",
    });

    assert.ok(reply.includes("example") || reply.includes("seal") || reply.includes("nozzle"));
  });

  test("lang='en' iken teknik/mühendislik tavsiyesi istendiğinde İngilizce guardrail ret cevabı vermelidir", async () => {
    const reply = await ai.chatClarification({
      questionTitle: "Material Selection",
      questionDescription: "Food contact safety.",
      userQuery: "Is PEEK safe for milk production?",
      conversationHistory: [],
      projectContext: "Print It Right study",
      lang: "en",
    });

    assert.ok(reply.includes("This survey cannot determine technical suitability"));
  });

  test("lang='tr' iken Türkçe guardrail ve açıklama cevapları verilmelidir", async () => {
    const reply = await ai.chatClarification({
      questionTitle: "Malzeme Seçimi",
      questionDescription: "Gıda temas uygunluğu.",
      userQuery: "Bu parça gıda için güvenli mi?",
      conversationHistory: [],
      projectContext: "Print It Right araştırması",
      lang: "tr",
    });

    assert.ok(reply.includes("Bu anket teknik uygunluk, malzeme seçimi veya gıda güvenliği"));
  });

  test("AI anket jeneratörü hem Türkçe hem İngilizce alanları aynı anda üretmelidir", async () => {
    const generated = await ai.generateSurveyFromPrompt(
      "Print It Right: Food safe parts and additive manufacturing discovery study"
    );

    // Üst Bilgiler
    assert.ok(generated.title && generated.title.length > 5, "title üretilmeli");
    assert.ok(generated.titleEn && generated.titleEn.length > 5, "titleEn üretilmeli");
    assert.ok(generated.tagline && generated.tagline.length > 2, "tagline üretilmeli");
    assert.ok(generated.taglineEn && generated.taglineEn.length > 2, "taglineEn üretilmeli");
    assert.ok(generated.description && generated.description.length > 10, "description üretilmeli");
    assert.ok(generated.descriptionEn && generated.descriptionEn.length > 10, "descriptionEn üretilmeli");

    // Sorular
    for (const q of generated.questions) {
      assert.ok(q.title && q.title.length > 5, "Her sorunun Türkçe title'ı olmalı");
      assert.ok(q.titleEn && q.titleEn.length > 5, "Her sorunun İngilizce titleEn'i olmalı");
      assert.ok(q.description && q.description.length > 10, "Her sorunun Türkçe description'ı olmalı");
      assert.ok(q.descriptionEn && q.descriptionEn.length > 10, "Her sorunun İngilizce descriptionEn'i olmalı");
      assert.ok(q.clarificationHint, "clarificationHint olmalı");
      assert.ok(q.clarificationHintEn, "clarificationHintEn olmalı");
      assert.strictEqual(q.maxDurationSec % 30, 0, "Süre 30 saniyenin katı olmalı");
    }
  });
});
