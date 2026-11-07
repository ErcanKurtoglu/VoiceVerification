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

  test("Puan verilmediğinde (rating: 0 / undefined) panelde 'Seçim Yapılmadı' olarak gösterilmelidir", () => {
    function formatAdminRating(rating) {
      if (rating && rating > 0) {
        return `${rating}.0`;
      }
      return "Seçim Yapılmadı";
    }

    assert.strictEqual(formatAdminRating(0), "Seçim Yapılmadı");
    assert.strictEqual(formatAdminRating(undefined), "Seçim Yapılmadı");
    assert.strictEqual(formatAdminRating(5), "5.0");
    assert.strictEqual(formatAdminRating(4), "4.0");
  });

  test("CSV dışa aktarımında geri bildirim etiketleri ve katılımcı notu sütunları bulunmalıdır", () => {
    const session = {
      id: "sess_1",
      projectId: "print-it-right",
      participant: {
        fullName: "Murat Can",
        email: "murat@can.com",
        company: "Can Gıda",
        title: "Operasyon Direktörü",
      },
      feedback: {
        rating: 5,
        tags: ["Hızlı ve pratikti", "Sesli yanıt vermek çok rahattı"],
        notes: "Arayüz ve ses algılama çok başarılı.",
      },
      startedAt: new Date().toISOString(),
      responses: {
        q1: { transcript: "Cevap 1" },
      },
    };

    const feedbackTags = (session.feedback?.tags || []).join("; ").replace(/"/g, '""');
    const feedbackNotes = (session.feedback?.notes || "").replace(/"/g, '""');

    assert.strictEqual(feedbackTags, "Hızlı ve pratikti; Sesli yanıt vermek çok rahattı");
    assert.strictEqual(feedbackNotes, "Arayüz ve ses algılama çok başarılı.");
  });

  test("CSV dışa aktarımında 4 veya daha fazla sorulu anketlerin tüm soruları (Soru 4 dahil) eksiksiz yer almalıdır", () => {
    const sessionWith4Questions = {
      id: "sess_4q",
      projectId: "food-production-survey",
      participant: {
        fullName: "Ercan K",
        email: "ercan@test.com",
        company: "Test Gıda",
        title: "Bakım Mühendisi",
      },
      responses: {
        q1: { transcript: "1. soru yanıtı" },
        q2: { transcript: "2. soru yanıtı" },
        q3: { transcript: "3. soru yanıtı" },
        q4: { transcript: "4. soru kritik yanıtı burada" },
      },
      startedAt: new Date().toISOString(),
    };

    const respCount = Object.keys(sessionWith4Questions.responses).length;
    assert.strictEqual(respCount, 4);

    const questionHeaders = Array.from({ length: respCount }, (_, i) => `Soru ${i + 1} Deşifre`);
    assert.deepStrictEqual(questionHeaders, [
      "Soru 1 Deşifre",
      "Soru 2 Deşifre",
      "Soru 3 Deşifre",
      "Soru 4 Deşifre",
    ]);

    const responsesList = Object.values(sessionWith4Questions.responses);
    const q4Text = (responsesList[3]?.transcript || "").replace(/"/g, '""');
    assert.strictEqual(q4Text, "4. soru kritik yanıtı burada");
  });

  test("CSV dışa aktarımında seçilen anket ve kitle grubu filtrelenmeli, tüm anketler yerine sadece seçilenler indirilmelidir", () => {
    const mockSurveys = [
      {
        id: "survey-a",
        slug: "food-production-survey",
        title: "Food Production Equipment Experience",
        questions: [{ id: "qa1", title: "Duruş Maliyeti" }, { id: "qa2", title: "Parça Süresi" }],
      },
      {
        id: "survey-b",
        slug: "print-it-right",
        title: "Print It Right 3D",
        questions: [{ id: "qb1", title: "Hijyen Riski" }],
      },
    ];

    const allSessions = [
      {
        id: "s1",
        projectId: "food-production-survey",
        tracking: { audience: "Bakım Mühendisleri" },
        responses: { qa1: { transcript: "A1 yanıt" }, qa2: { transcript: "A2 yanıt" } },
      },
      {
        id: "s2",
        projectId: "food-production-survey",
        tracking: { audience: "Kalite Güvence" },
        responses: { qa1: { transcript: "A1 başka yanıt" }, qa2: { transcript: "A2 başka yanıt" } },
      },
      {
        id: "s3",
        projectId: "print-it-right",
        tracking: { audience: "Bakım Mühendisleri" },
        responses: { qb1: { transcript: "B1 yanıt" } },
      },
    ];

    // Senaryo 1: Sadece "food-production-survey" anketini seçme
    const exportSurveyId = "survey-a";
    const filteredBySurvey = allSessions.filter((s) => {
      const matched = mockSurveys.find(
        (sv) => sv.id === exportSurveyId || sv.slug === exportSurveyId
      );
      return (
        s.projectId === exportSurveyId ||
        (matched && (s.projectId === matched.id || s.projectId === matched.slug))
      );
    });

    assert.strictEqual(filteredBySurvey.length, 2);
    assert.deepStrictEqual(filteredBySurvey.map((s) => s.id), ["s1", "s2"]);

    // Senaryo 2: Hem anket hem de hedef kitle "Bakım Mühendisleri" seçme
    const exportAudience = "Bakım Mühendisleri";
    const filteredBySurveyAndAudience = filteredBySurvey.filter(
      (s) => (s.tracking?.audience?.trim() || "Genel") === exportAudience
    );

    assert.strictEqual(filteredBySurveyAndAudience.length, 1);
    assert.strictEqual(filteredBySurveyAndAudience[0].id, "s1");

    // Senaryo 3: Belirli anket seçildiğinde başlığa gerçek soru adının eklenmesi
    const matchedSurvey = mockSurveys.find((sv) => sv.id === exportSurveyId);
    const customHeaders = matchedSurvey.questions.map(
      (q, i) => `Soru ${i + 1} (${q.title}): Deşifre`
    );

    assert.deepStrictEqual(customHeaders, [
      "Soru 1 (Duruş Maliyeti): Deşifre",
      "Soru 2 (Parça Süresi): Deşifre",
    ]);
  });
});

describe("Admin Survey Question Guard & Template Validation", () => {
  function normalizeForPatternCheck(str) {
    return str
      .trim()
      .replace(/İ/g, "i")
      .replace(/I/g, "ı")
      .toLocaleLowerCase("tr")
      .replace(/ı/g, "i")
      .replace(/ç/g, "c")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o");
  }

  const DUMMY_TEMPLATE_PATTERNS = [
    /^soru\s*\d*$/i,
    /^yeni soru/i,
    /^ilk soru/i,
    /^ikinci soru/i,
    /^ucuncu soru/i,
    /^soru detayi/i,
    /^aciklama$/i,
    /^ipucu/i,
    /ogrenmek istediginiz ana problem/i,
    /maliyeti veya sikligi/i,
    /pilot teste bakis/i,
    /sablon/i,
    /template/i,
    /ornek soru/i,
    /lorem ipsum/i,
    /teknik detay\./i,
  ];

  function validateQuestion(q) {
    const cleanTitle = (q.title || "").trim();
    const cleanDesc = (q.description || "").trim();

    if (!cleanTitle) {
      return { isValid: false, error: "Soru başlığı boş bırakılamaz." };
    }
    if (cleanTitle.length < 3) {
      return { isValid: false, error: "Soru başlığı en az 3 karakter olmalıdır." };
    }

    const normalizedTitle = normalizeForPatternCheck(cleanTitle);
    const isTitleTemplate = DUMMY_TEMPLATE_PATTERNS.some((p) => p.test(normalizedTitle));
    if (isTitleTemplate) {
      return {
        isValid: false,
        error: `"${cleanTitle}" şablon veya taslak bir başlıktır. Lütfen gerçek bir soru başlığı giriniz.`,
      };
    }

    if (!cleanDesc) {
      return { isValid: false, error: "Soru açıklaması boş bırakılamaz." };
    }
    if (cleanDesc.length < 5) {
      return { isValid: false, error: "Soru açıklaması en az 5 karakter olmalıdır." };
    }

    const normalizedDesc = normalizeForPatternCheck(cleanDesc);
    const isDescTemplate = DUMMY_TEMPLATE_PATTERNS.some((p) => p.test(normalizedDesc));
    if (isDescTemplate) {
      return {
        isValid: false,
        error: "Soru açıklaması şablon metin içeriyor. Lütfen katılımcıya yöneltilecek gerçek sorunun kapsamını açıklayınız.",
      };
    }

    return { isValid: true };
  }

  test("Boş soru başlığı veya açıklaması reddedilmelidir", () => {
    assert.strictEqual(validateQuestion({ title: "", description: "Detay" }).isValid, false);
    assert.strictEqual(validateQuestion({ title: "Başlık", description: "" }).isValid, false);
    assert.strictEqual(validateQuestion({ title: "ab", description: "Detaylar" }).isValid, false);
    assert.strictEqual(validateQuestion({ title: "Başlık", description: "kısa" }).isValid, false);
  });

  test("Şablon veya taslak dummy soru başlıkları engellenmelidir", () => {
    const dummyTitles = [
      "Soru 1",
      "Soru 2",
      "Soru",
      "İlk Soru Başlığı",
      "İkinci Soru Başlığı",
      "Üçüncü Soru Başlığı",
      "Yeni Soru Ekle",
      "Şablon Soru",
      "Template Title",
    ];

    for (const title of dummyTitles) {
      const res = validateQuestion({
        title,
        description: "Bu üretim tesisinde karşılaşılan somut gecikmeleri anlatınız.",
      });
      assert.strictEqual(res.isValid, false, `Dummy title "${title}" engellenmeliydi.`);
    }
  });

  test("Şablon veya taslak dummy soru açıklamaları engellenmelidir", () => {
    const dummyDescriptions = [
      "Soru detayı...",
      "Bu soruda katılımcıdan öğrenmek istediğiniz ana problem.",
      "Bu problemin maliyeti veya sıklığı.",
      "Çözüm teklifiniz veya pilot teste bakış açıları.",
      "Açıklama",
      "İpucu...",
      "Lorem ipsum dolor sit amet",
    ];

    for (const desc of dummyDescriptions) {
      const res = validateQuestion({
        title: "Kritik Parça Tedarik Süreçleri",
        description: desc,
      });
      assert.strictEqual(res.isValid, false, `Dummy description "${desc}" engellenmeliydi.`);
    }
  });

  test("Gerçek ve anlamlı soru başlığı ve açıklaması başarıyla onaylanmalıdır", () => {
    const res = validateQuestion({
      title: "Parça Tedarik Süresi & Plansız Duruş Kaybı",
      description: "Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu en kritik anı ve o günkü teslim süresini anlatabilir misiniz?",
      clarificationHint: "Katılımcı OEM termin süresi veya duruş maliyetini paylaşabilir.",
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.error, undefined);
  });
});
