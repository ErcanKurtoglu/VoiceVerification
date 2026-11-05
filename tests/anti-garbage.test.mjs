import { test, describe } from "node:test";
import assert from "node:assert";

// Anti-Garbage Mantık Testleri
describe("Anti-Garbage: Audio Quality & Duration Gate", () => {
  const MIN_AUDIO_DURATION_SEC = 3;
  const MIN_RMS_THRESHOLD = 0.015;

  function validateAudioRecording(durationSec, avgRms) {
    if (durationSec < MIN_AUDIO_DURATION_SEC) {
      return {
        isValid: false,
        reason: `Kayıt çok kısa (${Math.round(durationSec)} sn). Lütfen fikrinizi en az ${MIN_AUDIO_DURATION_SEC} saniye mikrofona konuşarak ifade ediniz.`,
      };
    }
    if (avgRms < MIN_RMS_THRESHOLD) {
      return {
        isValid: false,
        reason: "Mikrofondan yeterli ses algılanamadı.",
      };
    }
    return { isValid: true };
  }

  test("1 saniyelik çok kısa ses kaydını reddetmelidir", () => {
    const result = validateAudioRecording(1.2, 0.08);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason, /Kayıt çok kısa/);
  });

  test("Sessiz / mikrofonsuz kaydı (düşük RMS) reddetmelidir", () => {
    const result = validateAudioRecording(5.0, 0.002);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason, /yeterli ses algılanamadı/);
  });

  test("Geçerli ve kaliteli ses kaydını onaylamalıdır", () => {
    const result = validateAudioRecording(12.5, 0.045);
    assert.strictEqual(result.isValid, true);
  });
});

describe("Anti-Garbage: Honeypot & Bot Detection", () => {
  function isSpamSubmission(honeypot) {
    return Boolean(honeypot && honeypot.trim().length > 0);
  }

  test("Boş honeypot alanı (insan) geçmelidir", () => {
    assert.strictEqual(isSpamSubmission(""), false);
    assert.strictEqual(isSpamSubmission(undefined), false);
  });

  test("Doldurulmuş honeypot alanı (bot) engellenmelidir", () => {
    assert.strictEqual(isSpamSubmission("http://spam-link.com"), true);
  });
});
