import { test, describe } from "node:test";
import assert from "node:assert";
import {
  validateAudioRecording,
  MIN_AUDIO_DURATION_SEC,
  MIN_PEAK_RMS_THRESHOLD,
} from "../src/features/anti-garbage/audio-energy.ts";
import { isSpamSubmission } from "../src/features/anti-garbage/honeypot.ts";

describe("Anti-Garbage: Audio Quality & Duration Gate", () => {
  test("1 saniyelik çok kısa ses kaydını reddetmelidir (min süre eşiği)", () => {
    const result = validateAudioRecording(1.0, 0.05, 0.02, 2000);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason || "", /Kayıt çok kısa/);
  });

  test("Boş / 256 bayttan küçük kaydı bozuk dosya olarak reddetmelidir", () => {
    const result = validateAudioRecording(4.0, 0.001, 0.0005, 100);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason || "", /Ses dosyası kaydedilemedi/);
  });

  test("Mutlak sessizlik seviyesindeki kaydı (peak RMS < eşik) reddetmelidir", () => {
    const result = validateAudioRecording(3.5, 0.001, 0.0005, 500);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason || "", /yeterli ses algılanamadı/);
  });

  test("Geçerli ve kaliteli ses kaydını başarıyla onaylamalıdır", () => {
    const result = validateAudioRecording(5.5, 0.045, 0.02, 15000);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.reason, undefined);
  });

  test("Eşik değerleri mimari kurallara uygun olmalıdır", () => {
    assert.strictEqual(MIN_AUDIO_DURATION_SEC >= 2, true);
    assert.strictEqual(MIN_PEAK_RMS_THRESHOLD > 0, true);
  });
});

describe("Anti-Garbage: Honeypot & Bot Detection", () => {
  test("Boş veya tanımsız honeypot alanı (gerçek insan) geçmelidir", () => {
    assert.strictEqual(isSpamSubmission(""), false);
    assert.strictEqual(isSpamSubmission(undefined), false);
    assert.strictEqual(isSpamSubmission("   "), false);
  });

  test("Doldurulmuş honeypot alanı (otomatik bot) engellenmelidir", () => {
    assert.strictEqual(isSpamSubmission("http://spam-link.com"), true);
    assert.strictEqual(isSpamSubmission("bot_filler"), true);
  });
});

describe("Anti-Garbage: File Constraints & Cyber Defenses", () => {
  const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];

  function validateUploadConstraint(sizeBytes, mimeType) {
    if (sizeBytes > MAX_AUDIO_SIZE_BYTES) {
      return { allowed: false, reason: "Dosya boyutu 10 MB sınırını aşıyor." };
    }
    const baseMime = (mimeType || "").split(";")[0].toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(baseMime)) {
      return { allowed: false, reason: "Desteklenmeyen ses formatı." };
    }
    return { allowed: true };
  }

  test("10 MB altındaki geçerli ses formatlarını onaylamalıdır", () => {
    const res = validateUploadConstraint(5 * 1024 * 1024, "audio/webm;codecs=opus");
    assert.strictEqual(res.allowed, true);
  });

  test("10 MB üzerindeki ses dosyalarını reddetmelidir", () => {
    const res = validateUploadConstraint(12 * 1024 * 1024, "audio/webm");
    assert.strictEqual(res.allowed, false);
    assert.match(res.reason, /10 MB/);
  });

  test("Geçersiz veya zararlı dosya uzantılarını reddetmelidir", () => {
    const res = validateUploadConstraint(1024, "application/x-executable");
    assert.strictEqual(res.allowed, false);
    assert.match(res.reason, /Desteklenmeyen/);
  });
});
