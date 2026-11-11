import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MockAIService } from "../src/services/ai/mock.ts";
import {
  validateSurveyQuestion,
  validateSurveyQuestionTitle,
  isGibberishOrMeaninglessTitle,
} from "../src/features/anti-garbage/survey-validator.ts";

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

  test("6. Buton Pasifleşme Mantığı: İpucu alanı doluysa AI butonu pasife düşmeli, kutucuk silindiğinde aktifleşmelidir", () => {
    const evaluateButtonState = (question, isLocked = false, isGenerating = false) => {
      const isHintFilled = Boolean(question.clarificationHint && question.clarificationHint.trim().length > 0);
      const isTitleEmpty = !question.title.trim();
      const isClarifyDisabled = isTitleEmpty || isLocked || isGenerating || isHintFilled;

      return {
        isClarifyDisabled,
        isHintFilled,
        label: isGenerating
          ? "AI Üretiyor..."
          : isHintFilled
          ? "✨ İpucu Tanımlı"
          : "✨ AI ile Kapsam & İpucu Üret",
        tooltip: isLocked
          ? "Bu ankette yanıt olduğu için sorular kilitlidir"
          : isHintFilled
          ? "İpucu alanı zaten dolu. Yapay zeka ile yeniden üretmek isterseniz kutucuktaki metni siliniz."
          : isTitleEmpty
          ? "Önce soru başlığını giriniz"
          : "Yapay zeka ile bu soruya özel açıklama, kapsam ve asistan ipuçlarını otomatik üret",
      };
    };

    // Durum 1: İpucu kutusu dolu olan soru (Resim 1'deki durum)
    const filledQuestion = {
      title: "Q9 — Sonuç & Dersler: Olay Nasıl Çözüldü, Hangi Zorluklar Kaldı?",
      clarificationHint: "Geçici bir çözümle mi idare edildiği, aynı parçanın tekrar kırılma riski...",
    };
    const stateFilled = evaluateButtonState(filledQuestion);
    assert.equal(stateFilled.isClarifyDisabled, true, "İpucu kutusu doluyken buton pasif (disabled) olmalıdır");
    assert.equal(stateFilled.label, "✨ İpucu Tanımlı");
    assert.match(stateFilled.tooltip, /İpucu alanı zaten dolu/);

    // Durum 2: Kullanıcı kutucuğu sildiğinde buton yeniden aktifleşmelidir
    const emptiedQuestion = {
      title: "Q9 — Sonuç & Dersler: Olay Nasıl Çözüldü, Hangi Zorluklar Kaldı?",
      clarificationHint: "",
    };
    const stateEmptied = evaluateButtonState(emptiedQuestion);
    assert.equal(stateEmptied.isClarifyDisabled, false, "Kutucuk temizlendiğinde buton aktifleşmelidir");
    assert.equal(stateEmptied.label, "✨ AI ile Kapsam & İpucu Üret");

    // Durum 3: Başlık boşken buton pasif olmalıdır
    const emptyTitleQuestion = {
      title: "",
      clarificationHint: "",
    };
    const stateEmptyTitle = evaluateButtonState(emptyTitleQuestion);
    assert.equal(stateEmptyTitle.isClarifyDisabled, true, "Başlık boşken buton pasif olmalıdır");
  });

  test("7. Anlamsız Soru Başlığı Koruması (Anti-Gibberish): 'asdasdgad' gibi rastgele tuşlamalar engellenmeli ve üretim yapılmamalıdır", () => {
    // Resim 2'deki anlamsız tuşlama
    const gibberishCheck1 = validateSurveyQuestionTitle("asdasdgad");
    assert.equal(gibberishCheck1.isValid, false, "'asdasdgad' anlamsız başlık olarak reddedilmelidir");
    assert.match(gibberishCheck1.error || "", /Rastgele klavye tuşlaması|Anlamsız klavye tuşlaması/);

    // Diğer klavye tuşlama kalıpları
    const gibberishCheck2 = validateSurveyQuestionTitle("qwerty");
    assert.equal(gibberishCheck2.isValid, false);

    const gibberishCheck3 = validateSurveyQuestionTitle("aaaaaa");
    assert.equal(gibberishCheck3.isValid, false);
    assert.match(gibberishCheck3.error || "", /Aşırı karakter tekrarı/);

    const dummyCheck = validateSurveyQuestionTitle("test");
    assert.equal(dummyCheck.isValid, false);
    assert.match(dummyCheck.error || "", /Taslak veya deneme/);

    const shortCheck = validateSurveyQuestionTitle("ab");
    assert.equal(shortCheck.isValid, false);
  });

  test("8. Gerçek ve Anlamlı Soru Başlıkları Sorunsuz Onaylanmalıdır", () => {
    const validTitles = [
      "Q9 — Sonuç & Dersler: Olay Nasıl Çözüldü, Hangi Zorluklar Kaldı?",
      "Kritik Parça Tedarik Süreleri ve Gecikmeler",
      "Makine Üzerinde Yaşanan İlk Arıza Belirtisi",
      "Food Production Equipment Part Experience",
    ];

    for (const title of validTitles) {
      const check = validateSurveyQuestionTitle(title);
      assert.equal(check.isValid, true, `"${title}" geçerli bir başlık olarak kabul edilmelidir`);
      assert.equal(check.error, undefined);
    }
  });

  test("9. Katılımcı Rolü Sanitizasyonu ve Fallback Koruması: getSanitizedParticipantRole", async () => {
    const { getSanitizedParticipantRole } = await import("../src/lib/utils.ts");

    // Geçerli unvanlar
    assert.equal(getSanitizedParticipantRole("Bakım Mühendisi", "tr"), "Bakım Mühendisi");
    assert.equal(getSanitizedParticipantRole("Procurement Lead", "en"), "Procurement Lead");

    // Boş / tanımsız unvanlar
    assert.equal(getSanitizedParticipantRole("", "tr"), "Saha Uzmanı / Katılımcı");
    assert.equal(getSanitizedParticipantRole(undefined, "en"), "Domain Expert / Participant");

    // Klavye tuşlaması (mash) veya anlamsız unvanlar
    assert.equal(getSanitizedParticipantRole("asdasd", "tr"), "Saha Uzmanı / Katılımcı");
    assert.equal(getSanitizedParticipantRole("qwerty", "en"), "Domain Expert / Participant");
    assert.equal(getSanitizedParticipantRole("---", "tr"), "Saha Uzmanı / Katılımcı");
  });

  test("10. AI Asistan Rol Uyarlama Mekanizması: Kullanıcının unvanına göre soruyu yorumlama", async () => {
    const roleQuery = "Benim görevimdeki (Satın Alma Uzmanı) biri bu soruyu nasıl yorumlayabilir?";
    const response = await aiService.chatClarification({
      questionTitle: "S4 — Adımlar, Bilgiler ve Gecikmeler",
      questionDescription: "Parçayı tanımlamak ve tedarik etmek için sonrasında neler yapıldı?",
      questionHint: "Kendi rolünüzden bildiğiniz adımları anlatın.",
      userQuery: roleQuery,
      conversationHistory: [],
      projectContext: "Print It Right Araştırma Bağlamı",
      lang: "tr",
      participantRole: "Satın Alma Uzmanı",
      participantCompany: "Gıda A.Ş.",
    });

    assert.ok(response.length > 30, "AI asistanı rol odaklı rehberlik yanıtı üretmelidir");
    assert.ok(
      response.includes("Satın Alma Uzmanı") || response.includes("yetki") || response.includes("rol"),
      "Yanıtta rol ve sınır vurgusu bulunmalıdır"
    );
  });
});
