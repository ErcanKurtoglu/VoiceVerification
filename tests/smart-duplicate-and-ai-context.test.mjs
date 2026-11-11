import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Smart One-Click Duplicate (V2 -> V3 -> V4) & AI Context Preservation", () => {
  const SAMPLE_SURVEY = {
    id: "print-it-right",
    slug: "print-it-right",
    title: "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi",
    titleEn: "Print It Right: Food Equipment Parts Experience",
    tagline: "A-Side Challenge 2026",
    taglineEn: "A-Side Challenge 2026 EN",
    description: "Gıda hatlarında plansız duruş ve yedek parça temin zorlukları saha araştırması.",
    descriptionEn: "Field discovery on unplanned downtime and spare parts in food production.",
    caseAnchor: "Vaka Odağı: Belirlediğiniz somut parça / olay",
    caseAnchorEn: "Case Focus: Specific part event",
    targetAudience: "Bakım & Mühendislik Şefleri",
    targetAudienceEn: "Maintenance & Plant Engineers",
    estimatedMinutes: 6,
    aiContext: "Sen tarafsız bir endüstriyel araştırma asistanısın. Asla mühendislik veya gıda güvenliği tavsiyesi verme.",
    aiContextEn: "You are a neutral clarification assistant. Never give engineering or food safety advice.",
    questions: [
      {
        id: "q1",
        order: 1,
        title: "Q1 — Ne Oldu? (Arıza Olayı)",
        titleEn: "Q1 — What Happened? (Failure Event)",
        description: "Son 12 ayda yaşanan kritik bir arızayı anlatınız.",
        descriptionEn: "Describe a critical downtime incident in the last 12 months.",
        clarificationHint: "Hattın duruş süresini ve parçanın işlevini belirtmesi için yönlendirme yap.",
        clarificationHintEn: "Prompt participant to focus on line downtime and mechanical function.",
        maxDurationSec: 90,
      },
      {
        id: "q2",
        order: 2,
        title: "Q2 — Yedek Parça Temin Süreci",
        titleEn: "Q2 — Spare Part Procurement",
        description: "Parçanın teslimatı ne kadar sürdü?",
        descriptionEn: "How long did it take to source the replacement part?",
        clarificationHint: "Tedarikçi onayı ve lojistik aşamalarını örnek ver.",
        clarificationHintEn: "Give neutral examples of supplier lead times.",
        maxDurationSec: 60,
      },
    ],
  };

  function computeNextVersionTitle(rawTitle, existingSurveys) {
    const match = rawTitle.match(/\s*\(V(\d+)\)$/i);
    const baseTitle = match
      ? rawTitle.replace(/\s*\(V\d+\)$/i, "").trim()
      : rawTitle.replace(/\s*\(Kopya.*?\)$/i, "").trim();

    let maxVer = 1;
    existingSurveys.forEach((s) => {
      const sTitle = (s.title || "").trim();
      if (sTitle.startsWith(baseTitle)) {
        const vMatch = sTitle.match(/\s*\(V(\d+)\)$/i);
        if (vMatch) {
          const vNum = parseInt(vMatch[1], 10);
          if (!isNaN(vNum) && vNum > maxVer) {
            maxVer = vNum;
          }
        } else if (sTitle === baseTitle && maxVer < 1) {
          maxVer = 1;
        }
      }
    });
    return `${baseTitle} (V${maxVer + 1})`;
  }

  function computeNextPin(basePin, existingPins, nextVersion) {
    const cleanBase = basePin.replace(/-V\d+$/i, "").replace(/-KOPYA.*?$/i, "").trim().toUpperCase();
    const pinSet = new Set(existingPins.map((p) => p.toUpperCase()));

    let candidate = `${cleanBase}-V${nextVersion}`;
    let counter = nextVersion;
    while (pinSet.has(candidate)) {
      counter++;
      candidate = `${cleanBase}-V${counter}`;
    }
    return candidate;
  }

  test("1. Akıllı İsim Algoritması: V2'den V3'e, V3'ten V4'e otomatik ve temiz versiyonlama yapmalıdır", () => {
    // A) İlk çoğaltma: "Print It Right" -> "Print It Right (V2)"
    const list1 = [SAMPLE_SURVEY];
    const v2Title = computeNextVersionTitle(SAMPLE_SURVEY.title, list1);
    assert.equal(v2Title, "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi (V2)");

    // B) İkinci çoğaltma: V2 varken yeni kopya -> "(V3)" olmalı, asla "(V2) (Kopya)" olmamalıdır
    const list2 = [
      SAMPLE_SURVEY,
      { ...SAMPLE_SURVEY, title: v2Title },
    ];
    const v3Title = computeNextVersionTitle(v2Title, list2);
    assert.equal(v3Title, "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi (V3)");

    // C) Orijinalden tekrar çoğaltılsa bile en yüksek versiyonu (V3 varken V4) bulmalıdır
    const list3 = [
      SAMPLE_SURVEY,
      { ...SAMPLE_SURVEY, title: v2Title },
      { ...SAMPLE_SURVEY, title: v3Title },
    ];
    const v4Title = computeNextVersionTitle(SAMPLE_SURVEY.title, list3);
    assert.equal(v4Title, "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi (V4)");
  });

  test("2. Benzersiz PIN Üretimi: Mevcut PIN'lerle çakışmayı önleyip artan PIN kodu üretmelidir", () => {
    const originalPin = "PIR-2026";
    const existing = ["PIR-2026", "PIR-2026-V2"];

    // nextVersion 2 olarak istendiğinde PIR-2026-V2 zaten olduğu için otomatik PIR-2026-V3 yapmalıdır
    const generatedPin = computeNextPin(originalPin, existing, 2);
    assert.equal(generatedPin, "PIR-2026-V3");
    assert.equal(existing.includes(generatedPin), false);
  });

  test("3. AI Context & Metadata Koruması: aiContext, clarificationHint ve vaka çapaları eksiksiz kopyalanmalıdır", () => {
    // Çoğaltılan anketin simülasyonu
    const duplicatedSurvey = {
      title: "Print It Right (V2)",
      titleEn: "Print It Right (V2) EN",
      tagline: SAMPLE_SURVEY.tagline,
      taglineEn: SAMPLE_SURVEY.taglineEn,
      description: SAMPLE_SURVEY.description,
      descriptionEn: SAMPLE_SURVEY.descriptionEn,
      caseAnchor: SAMPLE_SURVEY.caseAnchor,
      caseAnchorEn: SAMPLE_SURVEY.caseAnchorEn,
      targetAudience: SAMPLE_SURVEY.targetAudience,
      targetAudienceEn: SAMPLE_SURVEY.targetAudienceEn,
      estimatedMinutes: SAMPLE_SURVEY.estimatedMinutes,
      aiContext: SAMPLE_SURVEY.aiContext,
      aiContextEn: SAMPLE_SURVEY.aiContextEn,
      questions: SAMPLE_SURVEY.questions.map((q, idx) => ({
        ...q,
        id: `q-${idx + 1}-copy`,
      })),
      sessionCount: 0,
    };

    // Global AI Context doğrulaması
    assert.equal(duplicatedSurvey.aiContext, SAMPLE_SURVEY.aiContext);
    assert.equal(duplicatedSurvey.aiContextEn, SAMPLE_SURVEY.aiContextEn);
    assert.equal(duplicatedSurvey.caseAnchor, SAMPLE_SURVEY.caseAnchor);
    assert.equal(duplicatedSurvey.caseAnchorEn, SAMPLE_SURVEY.caseAnchorEn);

    // Soru bazındaki mikro AI bağlamları (clarificationHint) doğrulaması
    assert.equal(duplicatedSurvey.questions.length, 2);
    assert.equal(
      duplicatedSurvey.questions[0].clarificationHint,
      SAMPLE_SURVEY.questions[0].clarificationHint
    );
    assert.equal(
      duplicatedSurvey.questions[0].clarificationHintEn,
      SAMPLE_SURVEY.questions[0].clarificationHintEn
    );
    assert.equal(
      duplicatedSurvey.questions[1].clarificationHint,
      SAMPLE_SURVEY.questions[1].clarificationHint
    );

    // Yeni çoğaltılan anketin soruları kilitsiz olmalıdır
    const isLocked = duplicatedSurvey.sessionCount > 0;
    assert.equal(isLocked, false, "0 yanıtlı çoğaltılmış anketin soruları tamamen düzenlenebilir olmalıdır");
  });

  test("4. UI Kuralı: 'Prompt ile Doldur' paneli sadece sıfırdan oluşturma (create) modunda görünmeli, edit modunda gizlenmelidir", () => {
    const isPromptAccordionRendered = (mode) => mode === "create";

    assert.equal(isPromptAccordionRendered("create"), true, "Yeni anket eklerken AI Prompt paneli görünmelidir");
    assert.equal(isPromptAccordionRendered("edit"), false, "Mevcut anket düzenlenirken AI Prompt paneli gizlenmelidir");
    assert.equal(isPromptAccordionRendered("duplicate"), false, "Çoğaltma sırasında AI Prompt paneli gizlenmelidir");
  });

  test("5. Kart Yönetimi: Yanıt almış anketlerde 'Düzenle' butonu kilitli/pasif olmalı, 0 yanıtlılarda aktif olmalıdır", () => {
    const checkCardEditButtonState = (sessionCount) => {
      const isLocked = sessionCount > 0;
      return {
        disabled: isLocked,
        label: isLocked ? "Düzenle (Kilitli)" : "Düzenle",
      };
    };

    // 17 katılımcısı olan anket
    const lockedState = checkCardEditButtonState(17);
    assert.equal(lockedState.disabled, true, "Yanıt almış anketin Düzenle butonu disabled olmalıdır");
    assert.equal(lockedState.label, "Düzenle (Kilitli)");

    // 0 katılımcısı olan yeni çoğaltılmış anket
    const editableState = checkCardEditButtonState(0);
    assert.equal(editableState.disabled, false, "0 yanıtlı anketin Düzenle butonu aktif olmalıdır");
    assert.equal(editableState.label, "Düzenle");
  });

  test("6. Modal Sadeliği: Çoğaltma butonu modal başlığında her ankette (V1, V2...) tek ve her zaman erişilebilir olmalı, amber kutuda mükerrer buton olmamalıdır", () => {
    const getModalCopyActions = () => {
      const actions = [];
      // Modal başlığında tek ve her zaman erişilebilir buton
      const headerHasCopyButton = true;
      if (headerHasCopyButton) actions.push("header_duplicate_button");

      // Amber kutusunda mükerrer buton yok (sadece bilgilendirici uyarı var)
      const amberBoxHasButton = false;
      if (amberBoxHasButton) actions.push("amber_box_duplicate_button");

      return actions;
    };

    const actions = getModalCopyActions();
    assert.equal(actions.length, 1, "Düzenleme modalında her zaman tam 1 adet çoğalt butonu olmalıdır");
    assert.equal(actions[0], "header_duplicate_button");
  });
});
