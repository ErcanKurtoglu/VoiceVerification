import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { generateSurveyCSV, escapeCSVCell } from "../src/lib/csv-export.ts";

// Test Anket Tanımları
const PRINT_IT_RIGHT_SURVEY = {
  id: "food-production-equipment-v2",
  slug: "print-it-right-2026",
  title: "Print It Right: Gıda Üretim Ekipmanı Parça Deneyimi Araştırması",
  description: "Gıda üretim hatlarında yaşanan plansız duruşlar ve parça temin süreçleri saha araştırması.",
  questions: [
    { id: "q1_incident", title: "Q1 — Ne Oldu? (Arıza & İhtiyaç Olayı)" },
    { id: "q2_part_role", title: "Q2 — Parçanın Rolü: Ekipmanda Ne İşe Yarıyordu?" },
    { id: "q3_response_steps", title: "Q3 — Müdahale: Sorun Fark Edilince Hangi Adımlar Atıldı?" },
    { id: "q4_part_info", title: "Q4 — Parça Bilgisi: Hangi Kayıtlar Vardı, Neler Eksikti?" },
    { id: "q5_procurement", title: "Q5 — Temin Deneyimi: Tedarikçiye Nasıl Ulaşıldı?" },
    { id: "q6_lead_time", title: "Q6 — Zaman Boyutu: Parça Ne Kadar Sürede Geldi?" },
    { id: "q7_downtime", title: "Q7 — Operasyonel Etki: Üretim Hattı ve Duruş Süresi Nasıl Etkilendi?" },
    { id: "q8_roles_approvals", title: "Q8 — Roller & Onaylar: Çözüm Sürecinde Kimler Yer Aldı?" },
    { id: "q9_lessons", title: "Q9 — Sonuç & Dersler: Olay Nasıl Çözüldü, Hangi Zorluklar Kaldı?" },
  ],
};

const OTHER_SURVEY = {
  id: "packaging-line-survey",
  slug: "packaging-line-2026",
  title: "Paketleme Hattı Robotik Otomasyon Anketi",
  description: "Paketleme hatlarındaki robotik kolların arıza ve bakım süreçleri.",
  questions: [
    { id: "pk1_robot_type", title: "P1 — Hangi tip robotik kol kullanılıyor?" },
    { id: "pk2_downtime", title: "P2 — Ortalama duruş süresi nedir?" },
    { id: "pk3_parts", title: "P3 — En sık bozulan parça hangisidir?" },
    { id: "pk4_supplier", title: "P4 — Tedarikçi servis hızı yeterli mi?" },
  ],
};

const SURVEYS_LIST = [PRINT_IT_RIGHT_SURVEY, OTHER_SURVEY];

// Test Katılımcı Oturumları
const PIR_SESSION = {
  id: "sess_pir_001",
  projectId: "food-production-equipment-v2",
  participant: {
    fullName: "Mehmet Demir",
    email: "mehmet@biskot.com.tr",
    company: "Biskot Gıda Sanayi",
    title: "Bakım Onarım Müdürü",
    consentGiven: true,
  },
  startedAt: "2026-11-07T14:30:00.000Z",
  completedAt: "2026-11-07T14:42:00.000Z",
  tracking: { uid: "usr_pir_1", ref: "code_PIR-2026", audience: "Bakım & Mühendislik" },
  responses: {
    q1_incident: { questionId: "q1_incident", transcript: "Bisküvi fırını giriş konveyöründe rulman kilitlendi.", mode: "voice", durationSeconds: 22 },
    q2_part_role: { questionId: "q2_part_role", transcript: "Hamur giriş bandını fırına süren tahrik tamburuydu.", mode: "voice", durationSeconds: 18 },
    q3_response_steps: { questionId: "q3_response_steps", transcript: "Hattı hemen durdurduk, yedek depoya baktık.", mode: "voice", durationSeconds: 25 },
    q4_part_info: { questionId: "q4_part_info", transcript: "Parça numarası silinmişti, kumpasla ölçtük, teknik resim yoktu.", mode: "voice", durationSeconds: 30 },
    q5_procurement: { questionId: "q5_procurement", transcript: "Almanya distribütörünü aradık, stokta yok dediler.", mode: "voice", durationSeconds: 28 },
    q6_lead_time: { questionId: "q6_lead_time", transcript: "Hava kargosuyla gelmesi tam 11 gün sürdü.", mode: "voice", durationSeconds: 15 },
    q7_downtime: { questionId: "q7_downtime", transcript: "Fırın 11 gün durdu, günde 15 ton bisküvi üretim kaybı oldu.", mode: "voice", durationSeconds: 34 },
    q8_roles_approvals: { questionId: "q8_roles_approvals", transcript: "Bakım şefi, fabrika müdürü ve satın alma uzmanı devredeydi.", mode: "voice", durationSeconds: 20 },
    q9_lessons: { questionId: "q9_lessons", transcript: "Özel alaşımlı paslanmaz rulman olduğu için yerlisini bulamadık, bundan sonra 2 adet yedek tutacağız.", mode: "voice", durationSeconds: 36 },
  },
  feedback: {
    rating: 5,
    tags: ["Sesli Yanıtlama Kolaylığı", "Yapay Zeka Asistanı Açıklamaları"],
    notes: "Çok hızlı ve verimli bir anket deneyimiydi, sesle konuşmak pratik.",
  },
  aiSanity: { isJunk: false },
};

const OTHER_SESSION = {
  id: "sess_pkg_002",
  projectId: "packaging-line-survey",
  participant: {
    fullName: "Ayşe Kaya",
    email: "ayse@ambalaj.com",
    company: "Mega Paketleme A.Ş.",
    title: "Otomasyon Şefi",
    consentGiven: true,
  },
  startedAt: "2026-11-07T15:00:00.000Z",
  completedAt: "2026-11-07T15:10:00.000Z",
  tracking: { uid: "usr_pkg_2", ref: "code_PKG-2026", audience: "Otomasyon & Robotik" },
  responses: {
    pk1_robot_type: { questionId: "pk1_robot_type", transcript: "Delta tipi 4 eksenli toplama robotu.", mode: "voice", durationSeconds: 14 },
    pk2_downtime: { questionId: "pk2_downtime", transcript: "Ayda ortalama 4 saat arıza duruşu yaşıyoruz.", mode: "voice", durationSeconds: 19 },
    pk3_parts: { questionId: "pk3_parts", transcript: "Vakum tutucu nozullar ve pnömatik hortumlar.", mode: "voice", durationSeconds: 16 },
    pk4_supplier: { questionId: "pk4_supplier", transcript: "Yerel servis 24 saat içinde gelebiliyor.", mode: "voice", durationSeconds: 21 },
  },
  feedback: {
    rating: 4,
    tags: ["Soru Kalitesi"],
    notes: "Sorular netti.",
  },
  aiSanity: { isJunk: false },
};

// CSV satırını RFC-4180 kurallarına göre parse eden test ayrıştırıcısı
function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

describe("CSV Export Engine & Data Integrity", () => {
  test("escapeCSVCell: virgüle, çift tırnağa ve satır sonuna sahip metinleri güvenle escape etmelidir", () => {
    assert.equal(escapeCSVCell("Normal metin"), '"Normal metin"');
    assert.equal(escapeCSVCell('Tırnak "içinde" metin'), '"Tırnak ""içinde"" metin"');
    assert.equal(escapeCSVCell("Parça Bilgisi: Hangi Kayıtlar Vardı, Neler Eksikti?"), '"Parça Bilgisi: Hangi Kayıtlar Vardı, Neler Eksikti?"');
    assert.equal(escapeCSVCell("Satır 1\nSatır 2\r\nSatır 3"), '"Satır 1 Satır 2 Satır 3"');
    assert.equal(escapeCSVCell(null), '""');
    assert.equal(escapeCSVCell(undefined), '""');
  });

  test("Test 1 — Print It Right Anketi İndirme: Başlık ve veri satır sütun sayıları birebir eşit olmalıdır (22 sütun)", () => {
    const result = generateSurveyCSV({
      sessions: [PIR_SESSION],
      surveysList: SURVEYS_LIST,
      exportSurveyId: "food-production-equipment-v2",
      exportAudience: "all",
    });

    assert.ok(result.csvContent.startsWith("\uFEFF"), "Excel uyumluluğu için UTF-8 BOM ile başlamalıdır");
    assert.ok(result.fileName.includes("print-it-right-2026") || result.fileName.includes("food-production-equipment-v2"));

    const lines = result.csvContent.replace("\uFEFF", "").split("\n").filter(Boolean);
    assert.equal(lines.length, 2, "1 başlık + 1 veri satırı olmalıdır");

    const headerCols = parseCSVLine(lines[0]);
    const dataCols = parseCSVLine(lines[1]);

    // 13 Temel Sütun + 9 Soru Sütunu = 22 Sütun
    assert.equal(headerCols.length, 22, `Başlık sütun sayısı 22 olmalı, alınan: ${headerCols.length}`);
    assert.equal(dataCols.length, 22, `Veri satırı sütun sayısı başlıkla birebir eşit (22) olmalı, alınan: ${dataCols.length}`);
    assert.equal(headerCols.length, dataCols.length, "Başlık ve veri satırı sütun sayısı kesinlikle eşit olmalıdır");

    // Soru 4 ve Soru 9 başlıklarında virgül olmasına rağmen sütun bölünmesi yaşanmamalıdır
    assert.ok(
      headerCols.some((h) => h.includes("Q4 — Parça Bilgisi: Hangi Kayıtlar Vardı, Neler Eksikti?")),
      "Q4 başlığındaki virgül kolonu bölmemelidir"
    );
    assert.ok(
      headerCols.some((h) => h.includes("Q9 — Sonuç & Dersler: Olay Nasıl Çözüldü, Hangi Zorluklar Kaldı?")),
      "Q9 başlığındaki virgül kolonu bölmemelidir"
    );

    // Q4 cevabının doğru sütuna denk geldiğini doğrula
    const q4HeaderIndex = headerCols.findIndex((h) => h.includes("Q4"));
    assert.ok(q4HeaderIndex !== -1, "Q4 sütunu bulunmalıdır");
    assert.equal(
      dataCols[q4HeaderIndex],
      "Parça numarası silinmişti, kumpasla ölçtük, teknik resim yoktu."
    );

    // Q9 cevabının doğru sütuna denk geldiğini doğrula
    const q9HeaderIndex = headerCols.findIndex((h) => h.includes("Q9"));
    assert.ok(q9HeaderIndex !== -1, "Q9 sütunu bulunmalıdır");
    assert.equal(
      dataCols[q9HeaderIndex],
      "Özel alaşımlı paslanmaz rulman olduğu için yerlisini bulamadık, bundan sonra 2 adet yedek tutacağız."
    );
  });

  test("Test 2 — Diğer Anket (Paketleme Hattı) İndirme: 4 sorulu anket için tam hizalama sağlanmalıdır", () => {
    const result = generateSurveyCSV({
      sessions: [OTHER_SESSION],
      surveysList: SURVEYS_LIST,
      exportSurveyId: "packaging-line-survey",
      exportAudience: "all",
    });

    assert.ok(result.fileName.includes("packaging-line-2026") || result.fileName.includes("packaging-line-survey"));

    const lines = result.csvContent.replace("\uFEFF", "").split("\n").filter(Boolean);
    assert.equal(lines.length, 2);

    const headerCols = parseCSVLine(lines[0]);
    const dataCols = parseCSVLine(lines[1]);

    // 13 Temel Sütun + 4 Soru Sütunu = 17 Sütun
    assert.equal(headerCols.length, 17, `4 sorulu anketin sütun sayısı 17 olmalı, alınan: ${headerCols.length}`);
    assert.equal(dataCols.length, 17, `Veri satırı sütun sayısı 17 olmalı, alınan: ${dataCols.length}`);
    assert.equal(headerCols.length, dataCols.length);

    // İlk sorunun cevabını kontrol et
    const p1Index = headerCols.findIndex((h) => h.includes("P1"));
    assert.ok(p1Index !== -1);
    assert.equal(dataCols[p1Index], "Delta tipi 4 eksenli toplama robotu.");
  });

  test("Test 3 — Tüm Anketler ('all') İndirme: Farklı anketlerden gelen tüm oturumlar tek CSV'de kusursuz hizalanmalıdır", () => {
    const result = generateSurveyCSV({
      sessions: [PIR_SESSION, OTHER_SESSION],
      surveysList: SURVEYS_LIST,
      exportSurveyId: "all",
      exportAudience: "all",
    });

    assert.ok(result.fileName.includes("all_surveys"));

    const lines = result.csvContent.replace("\uFEFF", "").split("\n").filter(Boolean);
    assert.equal(lines.length, 3, "1 başlık + 2 veri satırı olmalıdır");

    const headerCols = parseCSVLine(lines[0]);
    const row1Cols = parseCSVLine(lines[1]);
    const row2Cols = parseCSVLine(lines[2]);

    // Tüm anketler modunda max soru sayısı 9 olduğundan 13 + 9 = 22 sütun oluşmalıdır
    assert.equal(headerCols.length, 22);
    assert.equal(row1Cols.length, 22, "PIR satırı 22 sütun olmalıdır");
    assert.equal(row2Cols.length, 22, "Paketleme satırı da 22 sütun olmalıdır (boş sütunlar '\"\"' olmalıdır)");

    // Her satırın başlıkla eşit uzunlukta olduğunu doğrula
    assert.equal(headerCols.length, row1Cols.length);
    assert.equal(headerCols.length, row2Cols.length);

    // Paketleme anketinin 5. ve sonraki soru sütunlarının boş string ile güvenle doldurulduğunu doğrula
    assert.equal(row2Cols[17], "", "5. soru paketleme anketinde olmadığı için boş hücre olmalıdır");
    assert.equal(row2Cols[21], "", "9. soru paketleme anketinde olmadığı için boş hücre olmalıdır");
  });

  test("Test 4 — Kitle (Audience) Filtreleme: Yalnızca seçili kitleye ait katılımcıları dışa aktarmalıdır", () => {
    const result = generateSurveyCSV({
      sessions: [PIR_SESSION, OTHER_SESSION],
      surveysList: SURVEYS_LIST,
      exportSurveyId: "all",
      exportAudience: "Bakım & Mühendislik",
    });

    const lines = result.csvContent.replace("\uFEFF", "").split("\n").filter(Boolean);
    assert.equal(lines.length, 2, "Sadece 'Bakım & Mühendislik' kitlesinden 1 kişi gelmelidir");

    const dataCols = parseCSVLine(lines[1]);
    assert.equal(dataCols[3], "Mehmet Demir");
    assert.equal(dataCols[7], "Bakım & Mühendislik");
  });
});
