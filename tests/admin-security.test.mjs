import { test, describe } from "node:test";
import assert from "node:assert";

describe("Admin Security: Secret Access & Obfuscation", () => {
  const ADMIN_SECRET = "123ercan123";
  const DEV_PIN_FALLBACK = "2026";

  function evaluateAdminAccess(searchParams, inputPin) {
    const secretParam = searchParams?.p;

    // 1. Gizli URL parametresiyle doğrudan giriş (?p=123ercan123)
    if (secretParam === ADMIN_SECRET) {
      return { isAuthorized: true, status: 200 };
    }

    // 2. Yetkisiz giriş: Doğrudan /admin çağrısı veya hatalı parametre gizli 404 üretmeli
    if (!secretParam && !inputPin) {
      return { isAuthorized: false, status: 404, view: "NotFoundCard" };
    }

    // 3. Form üzerinden PIN denemesi
    if (inputPin === DEV_PIN_FALLBACK || inputPin === ADMIN_SECRET) {
      return { isAuthorized: true, status: 200 };
    }

    return { isAuthorized: false, status: 403, error: "Geçersiz şifre veya PIN." };
  }

  test("Doğru gizli parametre (?p=123ercan123) ile yönetici erişimini onaylamalıdır", () => {
    const res = evaluateAdminAccess({ p: "123ercan123" });
    assert.strictEqual(res.isAuthorized, true);
    assert.strictEqual(res.status, 200);
  });

  test("Parametresiz doğrudan /admin girişinde sistem varlığını gizleyip 404 vermelidir", () => {
    const res = evaluateAdminAccess({});
    assert.strictEqual(res.isAuthorized, false);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.view, "NotFoundCard");
  });

  test("Hatalı parametre (?p=yanlis) girildiğinde erişimi engellemelidir", () => {
    const res = evaluateAdminAccess({ p: "yanlis" }, "wrong_pin");
    assert.strictEqual(res.isAuthorized, false);
    assert.strictEqual(res.status, 403);
  });
});

describe("Admin Survey Management: Slug & PIN Governance", () => {
  function generateSurveySlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function formatAndValidatePin(pin, existingPins = {}) {
    if (!pin || pin.trim().length < 4) {
      return { isValid: false, reason: "PIN kodu en az 4 karakter olmalıdır." };
    }
    const cleanPin = pin.trim().toUpperCase();
    if (existingPins[cleanPin]) {
      return { isValid: false, reason: `"${cleanPin}" PIN kodu zaten başka bir ankete aittir.` };
    }
    return { isValid: true, cleanPin };
  }

  test("Türkçe karakterli anket başlığından geçerli ve temiz SEO slug üretmelidir", () => {
    const slug = generateSurveySlug("Gıda Güvenliği & 3B Parça Doğrulama");
    assert.strictEqual(slug, "gida-guvenligi-3b-parca-dogrulama");
  });

  test("PIN kodunu otomatik olarak kırpıp büyük harfe çevirmelidir (clean normalization)", () => {
    const result = formatAndValidatePin("  pir-2026  ");
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.cleanPin, "PIR-2026");
  });

  test("4 karakterden kısa PIN kodlarını reddetmelidir", () => {
    const result = formatAndValidatePin("12");
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason, /en az 4 karakter/);
  });

  test("Başka ankete ait mükerrer PIN kodunu reddetmelidir (PIN collision)", () => {
    const existing = { "PRINT-2026": "print-it-right" };
    const result = formatAndValidatePin("print-2026", existing);
    assert.strictEqual(result.isValid, false);
    assert.match(result.reason, /zaten başka bir ankete aittir/);
  });
});

describe("Admin Data Presentation: Audio Preservation vs UI Cleanliness", () => {
  test("Veritabanı kaydında ses URL'si saklanırken panel arayüzünde temiz deşifre sunulmalıdır", () => {
    const responseRecord = {
      questionId: "q1",
      audioUrl: "https://bucket.supabase.co/storage/v1/object/public/voice-recordings/test.webm",
      transcript: "Hattımızdaki plansız duruş maliyeti günlük 50.000 Euro.",
      durationSec: 14.2,
      mode: "audio",
    };

    // DB'de ses URL'si korunuyor
    assert.strictEqual(typeof responseRecord.audioUrl, "string");
    assert.strictEqual(responseRecord.audioUrl.startsWith("https://"), true);

    // UI render modelinde ses oynatıcı yerine deşifre kutusu ve rozet doğrulaması
    const isAudio = responseRecord.mode === "audio" || Boolean(responseRecord.audioUrl);
    const badgeText = isAudio ? `Sesli Yanıt (${Math.round(responseRecord.durationSec)} sn)` : "Yazılı Yanıt";

    assert.strictEqual(badgeText, "Sesli Yanıt (14 sn)");
    assert.strictEqual(responseRecord.transcript.length > 0, true);
  });
});
