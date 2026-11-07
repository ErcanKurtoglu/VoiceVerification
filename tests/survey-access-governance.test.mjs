import { test, describe } from "node:test";
import assert from "node:assert";
import {
  generateInviteToken,
  verifyInviteToken,
  evaluateSurveyAccess,
} from "../src/services/invitation/token.ts";

describe("Survey Access: Expiring Tokens & TTL Governance", () => {
  test("Geçerli bir davetiye token'ı üretmeli ve başarıyla doğrulamalıdır", () => {
    const token = generateInviteToken(
      "print-it-right",
      { fullName: "Caner Yılmaz", email: "caner@example.com", company: "Yılmaz Gıda", title: "Fabrika Müdürü" },
      { uid: "usr_9901", ref: "email_campaign" },
      7 // 7 gün geçerli
    );

    assert.strictEqual(typeof token, "string");
    assert.strictEqual(token.length > 20, true);

    const verification = verifyInviteToken(token);
    assert.strictEqual(verification.isValid, true);
    assert.strictEqual(verification.payload?.surveyId, "print-it-right");
    assert.strictEqual(verification.payload?.name, "Caner Yılmaz");
    assert.strictEqual(verification.payload?.uid, "usr_9901");
  });

  test("Süresi dolmuş (expired) token'ı tespit edip reddetmelidir", () => {
    // Geçmişte kalmış bir token simülasyonu (-1 gün)
    const expiredToken = generateInviteToken("print-it-right", {}, {}, -1);
    const verification = verifyInviteToken(expiredToken);

    assert.strictEqual(verification.isValid, false);
    assert.strictEqual(verification.reason, "expired");
  });

  test("Tahrif edilmiş (tampered / corrupted) token'ı reddetmelidir", () => {
    const corruptedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";
    const verification = verifyInviteToken(corruptedToken);

    assert.strictEqual(verification.isValid, false);
    assert.strictEqual(verification.reason, "invalid_token");
  });
});

describe("Survey Access: evaluateSurveyAccess Governance Rules", () => {
  test("Yetkisiz doğrudan erişim denemelerini engellemelidir (missing_access)", () => {
    const access = evaluateSurveyAccess("print-it-right", {});
    assert.strictEqual(access.isAllowed, false);
    assert.strictEqual(access.reason, "missing_access");
  });

  test("Geliştirici kısayolu (?n=e) için tam erişim sağlamalı ve Ercan verisini doldurmalıdır", () => {
    const access = evaluateSurveyAccess("print-it-right", { n: "e" });
    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.prefilledParticipant?.fullName, "Ercan");
    assert.strictEqual(access.prefilledParticipant?.consentGiven, true);
    assert.strictEqual(access.tracking?.ref, "dev_shortcut");
  });

  test("Geçerli kampanya kodu (?code=PIR-2026) ile girişi onaylamalıdır", () => {
    const access = evaluateSurveyAccess("print-it-right", { code: "PIR-2026" });
    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.tracking?.ref, "code_PIR-2026");
  });

  test("Geçersiz kampanya kodunu reddetmelidir", () => {
    const access = evaluateSurveyAccess("print-it-right", { code: "GEÇERSİZ-KOD-99" });
    assert.strictEqual(access.isAllowed, false);
  });

  test("Geçerli davetiye token'ı (?token=...) ile önceden tanımlı katılımcı bilgilerini sağlamalıdır", () => {
    const token = generateInviteToken("print-it-right", {
      fullName: "Selin Demir",
      email: "selin@gida.com",
      company: "Demir Konserve",
      title: "Satın Alma Müdürü",
    });

    const access = evaluateSurveyAccess("print-it-right", { token });
    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.prefilledParticipant?.fullName, "Selin Demir");
    assert.strictEqual(access.prefilledParticipant?.email, "selin@gida.com");
  });

  test("Başka bir ankete ait token ile erişimi engellemelidir (anket uyumsuzluğu)", () => {
    const otherSurveyToken = generateInviteToken("other-survey-id", { fullName: "Ali" });
    const access = evaluateSurveyAccess("print-it-right", { token: otherSurveyToken });
    assert.strictEqual(access.isAllowed, false);
    assert.strictEqual(access.reason, "missing_access");
  });

  test("Kurumsal CRM parametreleri (?uid=... veya ?name=...) ile erişimi onaylamalıdır", () => {
    const access = evaluateSurveyAccess("print-it-right", {
      uid: "crm_user_55",
      name: "Mehmet Öz",
      email: "mehmet@oz.com",
    });
    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.tracking?.uid, "crm_user_55");
    assert.strictEqual(access.prefilledParticipant?.fullName, "Mehmet Öz");
  });

  test("Pasife alınmış anket için geçerli token, kod veya kısayol dahi olsa erişim engellenmelidir (survey_inactive)", () => {
    // 1. Kampanya kodu ile pasif ankete erişim
    const codeAccess = evaluateSurveyAccess("print-it-right", { code: "PIR-2026" }, false);
    assert.strictEqual(codeAccess.isAllowed, false);
    assert.strictEqual(codeAccess.reason, "survey_inactive");

    // 2. Geçerli süreli token ile pasif ankete erişim
    const validToken = generateInviteToken("print-it-right", { fullName: "Test Katılımcı" });
    const tokenAccess = evaluateSurveyAccess("print-it-right", { token: validToken }, false);
    assert.strictEqual(tokenAccess.isAllowed, false);
    assert.strictEqual(tokenAccess.reason, "survey_inactive");

    // 3. Geliştirici kısayolu dahi olsa pasif ankette engellenmeli
    const devAccess = evaluateSurveyAccess("print-it-right", { n: "e" }, false);
    assert.strictEqual(devAccess.isAllowed, false);
    assert.strictEqual(devAccess.reason, "survey_inactive");
  });

  test("Hedef kitleye özel link parametresi (?audience=...) ile erişim onaylanmalı ve segment tracking'e işlenmelidir", () => {
    const audienceLink = evaluateSurveyAccess("print-it-right", {
      audience: "Bakım Mühendisleri",
      ref: "camp_bakim",
    });
    assert.strictEqual(audienceLink.isAllowed, true);
    assert.strictEqual(audienceLink.audience, "Bakım Mühendisleri");
    assert.strictEqual(audienceLink.tracking?.audience, "Bakım Mühendisleri");
    assert.strictEqual(audienceLink.tracking?.ref, "camp_bakim");
  });

  test("Kişiye özel davet token'ında saklanan hedef kitle başarıyla çözülmeli ve oturuma aktarılmalıdır", () => {
    const token = generateInviteToken(
      "print-it-right",
      { fullName: "Ahmet Usta", email: "ahmet@fabrika.com", title: "Başmühendis" },
      { uid: "usr_44" },
      7,
      "Kalite & Hijyen Şefleri" // Hedef Kitle / Segment
    );

    const access = evaluateSurveyAccess("print-it-right", { token });
    assert.strictEqual(access.isAllowed, true);
    assert.strictEqual(access.audience, "Kalite & Hijyen Şefleri");
    assert.strictEqual(access.tracking?.audience, "Kalite & Hijyen Şefleri");
    assert.strictEqual(access.prefilledParticipant?.fullName, "Ahmet Usta");
  });
});
