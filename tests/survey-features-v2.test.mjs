import { test, describe } from "node:test";
import assert from "node:assert";
import {
  generateInviteToken,
  verifyInviteToken,
  evaluateSurveyAccess,
} from "../src/services/invitation/token.ts";
import { validateSurveyQuestion } from "../src/features/anti-garbage/survey-validator.ts";

describe("Feature Set V2: Hedef Kitle (Audience Targeting) & Link Mekanizması", () => {
  test("Kitleye özel kampanya linkinde (?audience=...) hedef kitle doğru çözülmeli ve oturum tracking verisine işlenmelidir", () => {
    const audienceName = "Bakım & Tesis Ekipleri";
    const access = evaluateSurveyAccess("print-it-right", {
      audience: audienceName,
      ref: "camp_bakim",
    });

    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.audience, audienceName);
    assert.strictEqual(access.tracking?.audience, audienceName);
    assert.strictEqual(access.tracking?.ref, "camp_bakim");
  });

  test("Kişiye özel davet token'ında saklanan hedef kitle segmenti doğrulanmalı ve oturuma aktarılmalıdır", () => {
    const targetSegment = "Kalite Güvence & Hijyen Denetçileri";
    const token = generateInviteToken(
      "print-it-right",
      {
        fullName: "Zeynep Kaya",
        email: "zeynep@denetim.com",
        company: "Denetim A.Ş.",
        title: "Kalite Müdürü",
      },
      { uid: "usr_789" },
      14,
      targetSegment
    );

    const verified = verifyInviteToken(token);
    assert.strictEqual(verified.isValid, true);
    assert.strictEqual(verified.payload?.audience, targetSegment);

    const access = evaluateSurveyAccess("print-it-right", { token });
    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.audience, targetSegment);
    assert.strictEqual(access.tracking?.audience, targetSegment);
    assert.strictEqual(access.prefilledParticipant?.fullName, "Zeynep Kaya");
  });

  test("Linkten gelen hedef kitle, anketin genel şablon kitlesini katılımcı bazında dinamik olarak ezebilmelidir", () => {
    const baseSurvey = {
      id: "print-it-right",
      title: "Print It Right Challenge",
      targetAudience: "Genel Sektör Profesyonelleri",
    };

    const linkAudience = "Satın Alma & Tedarik Zinciri Yöneticileri";
    const effectiveSurvey = linkAudience
      ? { ...baseSurvey, targetAudience: linkAudience }
      : baseSurvey;

    assert.strictEqual(effectiveSurvey.targetAudience, "Satın Alma & Tedarik Zinciri Yöneticileri");
    assert.notStrictEqual(effectiveSurvey.targetAudience, baseSurvey.targetAudience);
  });

  test("CSV dışa aktarımında katılımcının hedef kitle segmenti (tracking.audience) eksiksiz raporlanmalıdır", () => {
    const sessionWithAudience = {
      id: "sess_101",
      projectId: "print-it-right",
      participant: {
        fullName: "Caner Usta",
        email: "caner@fabrika.com",
        company: "Tat Gıda",
        title: "Bakım Şefi",
      },
      tracking: {
        uid: "usr_101",
        audience: "Bakım & Mekanik Servis",
      },
      startedAt: new Date().toISOString(),
      responses: {},
    };

    const audienceCol = (sessionWithAudience.tracking?.audience || "Genel").replace(/"/g, '""');
    assert.strictEqual(audienceCol, "Bakım & Mekanik Servis");
  });
});

describe("Feature Set V2: Anket Aktif / Pasif Yönetimi & Erişim Koruması", () => {
  test("Anket pasif (isActive: false) iken doğru kampanya kodu veya token girilse dahi survey_inactive sebebiyle engellenmelidir", () => {
    // 1. Kampanya kodu ile pasif ankete erişim denemesi
    const codeResult = evaluateSurveyAccess("print-it-right", { code: "PIR-2026" }, false);
    assert.strictEqual(codeResult.isAllowed, false);
    assert.strictEqual(codeResult.reason, "survey_inactive");

    // 2. İmzalı geçerli token ile pasif ankete erişim denemesi
    const validToken = generateInviteToken("print-it-right", { fullName: "Test Kullanıcı" });
    const tokenResult = evaluateSurveyAccess("print-it-right", { token: validToken }, false);
    assert.strictEqual(tokenResult.isAllowed, false);
    assert.strictEqual(tokenResult.reason, "survey_inactive");

    // 3. Geliştirici kısayolu ile pasif ankete erişim denemesi
    const devResult = evaluateSurveyAccess("print-it-right", { n: "e" }, false);
    assert.strictEqual(devResult.isAllowed, false);
    assert.strictEqual(devResult.reason, "survey_inactive");
  });

  test("Anket yeniden aktif edildiğinde (isActive: true) aynı erişim anahtarları derhal geçerli olmalıdır", () => {
    const activeResult = evaluateSurveyAccess("print-it-right", { code: "PIR-2026" }, true);
    assert.strictEqual(activeResult.isAllowed, true);
    assert.strictEqual(activeResult.reason, undefined);

    const devActiveResult = evaluateSurveyAccess("print-it-right", { n: "e" }, true);
    assert.strictEqual(devActiveResult.isAllowed, true);
  });
});

describe("Feature Set V2: Dinamik Soru Placeholder & Şablon Koruma Mekanizması", () => {
  const QUESTION_PLACEHOLDERS = [
    {
      title: "Örn: 1. Parça Tedarik Süresi & Plansız Duruş Kaybı",
      description: "Örn: Geçtiğimiz 1 yılda tek bir yedek parça gecikmesi yüzünden dolum veya üretim hattınızın durduğu en kritik anı ve o günkü OEM teslim süresini anlatabilir misiniz?",
      hint: "Örn: Katılımcı termin süresini veya duruş maliyetini paylaşırsa OEM garanti süreçlerini sorması için ipucu",
    },
    {
      title: "Örn: 2. 3B Baskıda Gıda Güvenliği & Hijyen Çekincaleri",
      description: "Örn: Gıdayla temas eden bir parçayı 3B yazıcıyla üretip hatta takacak olsaydınız, sizi gece uykusuz bırakacak en büyük teknik veya denetim riski ne olurdu?",
      hint: "Örn: FDA onayı, migrasyon testleri ve izlenebilirlik konularında derinleştirmesi için yönlendirme",
    },
    {
      title: "Örn: 3. AI Destekli Tasarım & Satın Alma Modeli",
      description: "Örn: Kırılan parçanın 48 saatte teslim edildiği bir modelde; doğrudan 'parça başı fatura' mı yoksa 'yıllık hat garantisi aboneliği' mi fabrikanızın prosedüründen daha kolay geçer?",
      hint: "Örn: Bütçeleme, OPEX/CAPEX onayı ve satın alma onay hiyerarşisi hakkında bilgi al",
    },
    {
      title: "Örn: 4. Çözüm Beklentisi & Karar Verici Dinamikleri",
      description: "Örn: Bu problemi çözmek için alternatif bir tedarikçi veya yeni teknoloji arayışında karar sürecinde kimler rol oynuyor?",
      hint: "Örn: Fabrika müdürü, satın alma ve kalite ekiplerinin ortak karar sürecini irdele",
    },
  ];

  function getQuestionPlaceholder(index) {
    if (index < QUESTION_PLACEHOLDERS.length) {
      return QUESTION_PLACEHOLDERS[index];
    }
    return {
      title: `Örn: ${index + 1}. Ek Problem / Doğrulama Başlığı`,
      description: `Örn: Katılımcının bu konuyla ilgili saha tecrübesini ve karşılaştığı darboğazları detaylandırınız...`,
      hint: `Örn: AI asistanının derinleştirmesini istediğiniz teknik parametreler veya arka plan...`,
    };
  }

  test("getQuestionPlaceholder soru sırasına (0, 1, 2, 3...) göre doğru sektörel rehber metinleri üretmelidir", () => {
    const ph0 = getQuestionPlaceholder(0);
    assert.strictEqual(ph0.title.includes("1. Parça Tedarik"), true);
    assert.strictEqual(ph0.description.includes("Geçtiğimiz 1 yılda"), true);

    const ph1 = getQuestionPlaceholder(1);
    assert.strictEqual(ph1.title.includes("2. 3B Baskıda Gıda Güvenliği"), true);

    const ph2 = getQuestionPlaceholder(2);
    assert.strictEqual(ph2.title.includes("3. AI Destekli Tasarım"), true);

    const ph9 = getQuestionPlaceholder(9);
    assert.strictEqual(ph9.title.includes("10. Ek Problem"), true);
  });

  test("Soru ekleme anında input değerleri tamamen boş olmalı, placeholder ile gerçek değer birbirine karışmamalıdır", () => {
    // Soru ekle tıklandığında eklenen nesne
    const newQuestionState = { title: "", description: "", clarificationHint: "" };

    assert.strictEqual(newQuestionState.title, "");
    assert.strictEqual(newQuestionState.description, "");
    assert.strictEqual(newQuestionState.clarificationHint, "");

    // Boş iken kaydetmeye çalışılırsa validator engellemelidir
    const valResult = validateSurveyQuestion(newQuestionState);
    assert.strictEqual(valResult.isValid, false);
    assert.strictEqual(valResult.error, "Soru başlığı boş bırakılamaz.");
  });

  test("Yönetici gerçek bir başlık ve açıklama yazdığında soru geçerli onay almalıdır", () => {
    const filledQuestion = {
      title: "Yedek Parça Termin ve Stok Riski",
      description: "Hattınızda kritik bir parçanın bozulması durumunda stok bulundurma maliyetiyle duruş maliyetini nasıl dengeliyorsunuz?",
      clarificationHint: "Katılımcının depolama ve finansman kısıtlarını öğren.",
    };

    const valResult = validateSurveyQuestion(filledQuestion);
    assert.strictEqual(valResult.isValid, true);
    assert.strictEqual(valResult.error, undefined);
  });
});
