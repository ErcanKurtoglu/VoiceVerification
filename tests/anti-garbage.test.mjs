import { test, describe } from "node:test";
import assert from "node:assert";

// Anti-Garbage Mantık Testleri
describe("Anti-Garbage: Audio Quality & Duration Gate", () => {
  const MIN_AUDIO_DURATION_SEC = 2;
  const MIN_PEAK_RMS_THRESHOLD = 0.003;

  function validateAudioRecording(durationSec, peakRms, avgRms, fileSizeBytes = 2000) {
    if (durationSec < MIN_AUDIO_DURATION_SEC) {
      return {
        isValid: false,
        reason: `Kayıt çok kısa (${Math.round(durationSec)} sn). Lütfen fikrinizi en az ${MIN_AUDIO_DURATION_SEC} saniye mikrofona konuşarak ifade ediniz.`,
      };
    }
    if (fileSizeBytes > 0 && fileSizeBytes < 256) {
      return {
        isValid: false,
        reason: "Ses dosyası kaydedilemedi.",
      };
    }
    if (peakRms < MIN_PEAK_RMS_THRESHOLD && fileSizeBytes < 1000) {
      return {
        isValid: false,
        reason: "Mikrofondan yeterli ses algılanamadı.",
      };
    }
    return { isValid: true };
  }

  test("1 saniyelik çok kısa ses kaydını reddetmelidir", () => {
    const result = validateAudioRecording(1.0, 0.05, 0.02, 2000);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason, /Kayıt çok kısa/);
  });

  test("Boş / 0 bayt kaydı reddetmelidir", () => {
    const result = validateAudioRecording(4.0, 0.001, 0.0005, 100);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason, /Ses dosyası kaydedilemedi/);
  });

  test("Geçerli ve kaliteli ses kaydını onaylamalıdır", () => {
    const result = validateAudioRecording(5.5, 0.045, 0.02, 15000);
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
