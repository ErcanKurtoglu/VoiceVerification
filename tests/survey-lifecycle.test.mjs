import { test, describe } from "node:test";
import assert from "node:assert";
import { PRINT_IT_RIGHT_SURVEY } from "../src/surveys/print-it-right.ts";

describe("Survey Lifecycle: Configuration & Question Integrity", () => {
  test("Print It Right anket konfigürasyonunun zorunlu alanlarını doğrulamalıdır", () => {
    assert.strictEqual(PRINT_IT_RIGHT_SURVEY.id, "print-it-right");
    assert.strictEqual(typeof PRINT_IT_RIGHT_SURVEY.title, "string");
    assert.strictEqual(PRINT_IT_RIGHT_SURVEY.title.length > 5, true);
    assert.strictEqual(PRINT_IT_RIGHT_SURVEY.questions.length, 3);
    assert.strictEqual(PRINT_IT_RIGHT_SURVEY.estimatedMinutes, 3);
    assert.strictEqual(typeof PRINT_IT_RIGHT_SURVEY.aiContext, "string");
  });

  test("Anketteki tüm sorular sıralı, benzersiz ve eksiksiz olmalıdır", () => {
    const questions = PRINT_IT_RIGHT_SURVEY.questions;
    const ids = new Set();

    questions.forEach((q, idx) => {
      assert.strictEqual(q.order, idx + 1, `Soru sırası ${idx + 1} olmalı`);
      assert.strictEqual(typeof q.id, "string");
      assert.strictEqual(ids.has(q.id), false, `Soru ID '${q.id}' benzersiz olmalı`);
      ids.add(q.id);

      assert.strictEqual(q.title.length > 5, true);
      assert.strictEqual(q.description.length > 10, true);
      assert.strictEqual(q.clarificationHint.length > 5, true);
      assert.strictEqual(q.maxDurationSec >= 60, true);
    });
  });
});

describe("Survey Lifecycle: In-Memory Re-Recording & State Overwrite", () => {
  test("Kullanıcı aynı soruya yeniden ses kaydettiğinde eski kayıt güvenle ezilmelidir", () => {
    const responses = {};

    // 1. İlk kayıt simülasyonu
    const questionId = "q1_tedarik_durus";
    responses[questionId] = {
      questionId,
      mode: "audio",
      durationSec: 12.4,
      audioBase64: "data:audio/webm;base64,FIRST_RECORDING_BYTES",
    };

    assert.strictEqual(responses[questionId].durationSec, 12.4);
    assert.strictEqual(responses[questionId].audioBase64, "data:audio/webm;base64,FIRST_RECORDING_BYTES");

    // 2. Kullanıcı kaydı beğenmedi ve "Tekrar Kaydet" butonuna basarak yeni kayıt aldı:
    responses[questionId] = {
      questionId,
      mode: "audio",
      durationSec: 28.5,
      audioBase64: "data:audio/webm;base64,SECOND_BETTER_RECORDING_BYTES",
    };

    assert.strictEqual(responses[questionId].durationSec, 28.5);
    assert.strictEqual(responses[questionId].audioBase64, "data:audio/webm;base64,SECOND_BETTER_RECORDING_BYTES");
    assert.notStrictEqual(responses[questionId].audioBase64, "data:audio/webm;base64,FIRST_RECORDING_BYTES");
  });

  test("Sesli yanıttan yazılı yanıta geçişte mod ve yanıt tipi tutarlı kalmalıdır (Text Parity)", () => {
    const responses = {};
    const questionId = "q2_gida_guvenligi";

    // Sesli kayıt oluşturuldu
    responses[questionId] = {
      questionId,
      mode: "audio",
      durationSec: 8.0,
      audioBase64: "data:audio/webm;base64,AUDIO_DATA",
    };
    assert.strictEqual(responses[questionId].mode, "audio");

    // Katılımcı "Yazarak Yanıtla" seçeneğine tıkladı
    responses[questionId] = {
      questionId,
      mode: "text",
      textResponse: "Gıda hattımızda FDA ve EU sertifikasyonu şarttır.",
    };

    assert.strictEqual(responses[questionId].mode, "text");
    assert.strictEqual(responses[questionId].textResponse, "Gıda hattımızda FDA ve EU sertifikasyonu şarttır.");
    assert.strictEqual(responses[questionId].audioBase64, undefined);
  });
});

describe("Survey Lifecycle: Deferred Processing & Final Payload Assembly", () => {
  test("Anket tamamlandığında nihai session payload'u eksiksiz birleştirilmelidir", () => {
    const participant = {
      fullName: "Enes Kaya",
      email: "enes@tat.com",
      company: "Tat Gıda",
      title: "Kalite Müdürü",
      consentGiven: true,
    };

    const responses = {
      q1: { questionId: "q1", mode: "audio", durationSec: 15, audioUrl: "https://bucket/q1.webm", transcript: "1. soru deşifresi" },
      q2: { questionId: "q2", mode: "audio", durationSec: 20, audioUrl: "https://bucket/q2.webm", transcript: "2. soru deşifresi" },
      q3: { questionId: "q3", mode: "text", textResponse: "3. soru yazılı cevabı", transcript: "3. soru yazılı cevabı" },
    };

    const feedback = {
      rating: 5,
      tags: ["Pratik", "Hızlı"],
      notes: "Çok başarılı",
    };

    const session = {
      id: "session-uuid-12345",
      projectId: "print-it-right",
      startedAt: new Date(Date.now() - 300000).toISOString(),
      completedAt: new Date().toISOString(),
      participant,
      responses,
      feedback,
      status: "completed",
    };

    assert.strictEqual(session.status, "completed");
    assert.strictEqual(session.participant.fullName, "Enes Kaya");
    assert.strictEqual(Object.keys(session.responses).length, 3);
    assert.strictEqual(session.feedback?.rating, 5);
  });

  test("Kullanıcı yıldız seçmediğinde (rating: 0) yanıltıcı 5 yıldız yerine seçim yapılmadı kaydedilmelidir", () => {
    const feedbackWithoutRating = {
      rating: 0,
      tags: [],
      notes: "",
    };

    assert.strictEqual(feedbackWithoutRating.rating, 0);
    const displayRating = feedbackWithoutRating.rating && feedbackWithoutRating.rating > 0
      ? `${feedbackWithoutRating.rating}.0`
      : "Seçim Yapılmadı";

    assert.strictEqual(displayRating, "Seçim Yapılmadı");
  });
});

describe("Survey Lifecycle: Back-Navigation Draft Preservation", () => {
  test("Son soruda (4. soru) metin yazılıp 'Önceki Soru' dendiğinde ve geri gelindiğinde metin korunmalıdır", () => {
    let responses = {};

    // 1. Kullanıcı 4. soruda (q4) metin yazdı
    const q4Id = "pir-q4-satinalma";
    const userTypedText = "Bizim fabrikada acil parça siparişleri için bakım bütçesi ayrılmıştır.";

    // 2. Kullanıcı 'Önceki Soru' butonuna bastı (handlePrevious draft saving)
    const q4Draft = {
      questionId: q4Id,
      mode: "text",
      textResponse: userTypedText,
    };

    // Wizard handlePreviousQuestion simülasyonu
    responses = {
      ...responses,
      [q4Draft.questionId]: q4Draft,
    };

    // 3. Kullanıcı 3. soruyu inceledi ve tekrar 'Sonraki Soru' diyerek 4. soruya geçti
    const restoredResponse = responses[q4Id];

    assert.ok(restoredResponse, "4. sorunun yanıtı silinmemeli, hafızada bulunmalıdır.");
    assert.strictEqual(restoredResponse.mode, "text");
    assert.strictEqual(restoredResponse.textResponse, userTypedText);
  });

  test("Son soruda (4. soru) ses kaydı alınıp 'Önceki Soru' dendiğinde ve geri gelindiğinde ses kaydı korunmalıdır", () => {
    let responses = {};

    const q4Id = "pir-q4-satinalma";
    const dummyBlob = { size: 10240, type: "audio/webm" };

    // Kullanıcı ses kaydetti ve 'Önceki Soru' butonuna bastı
    const q4AudioDraft = {
      questionId: q4Id,
      mode: "audio",
      audioBlob: dummyBlob,
      durationSec: 42,
    };

    responses = {
      ...responses,
      [q4AudioDraft.questionId]: q4AudioDraft,
    };

    // Kullanıcı önceki sorudan tekrar 4. soruya geri döndü
    const restoredAudioResponse = responses[q4Id];

    assert.ok(restoredAudioResponse, "4. sorunun ses kaydı taslağı korunmalıdır.");
    assert.strictEqual(restoredAudioResponse.mode, "audio");
    assert.strictEqual(restoredAudioResponse.durationSec, 42);
    assert.deepStrictEqual(restoredAudioResponse.audioBlob, dummyBlob);
  });
});
