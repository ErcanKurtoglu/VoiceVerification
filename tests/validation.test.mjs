import { test, describe } from "node:test";
import assert from "node:assert";
import { ParticipantSchema, FeedbackSchema } from "../src/types/interview.ts";

describe("Validation: Participant Schema (Zod)", () => {
  const validParticipant = {
    fullName: "Ercan Kurtoğlu",
    email: "ercan@example.com",
    company: "A-Side Tech",
    title: "Ürün Yöneticisi",
    linkedinUrl: "https://linkedin.com/in/ercankurtoglu",
    consentGiven: true,
  };

  test("Eksiksiz ve geçerli katılımcı verisini doğrulamalıdır", () => {
    const parsed = ParticipantSchema.safeParse(validParticipant);
    assert.strictEqual(parsed.success, true);
    if (parsed.success) {
      assert.strictEqual(parsed.data.fullName, "Ercan Kurtoğlu");
      assert.strictEqual(parsed.data.email, "ercan@example.com");
      assert.strictEqual(parsed.data.consentGiven, true);
    }
  });

  test("Türkçe karakterli isimleri sorunsuz kabul etmelidir", () => {
    const parsed = ParticipantSchema.safeParse({
      ...validParticipant,
      fullName: "Özgür Çağlar Şahin",
      company: "İnci Gıda A.Ş.",
    });
    assert.strictEqual(parsed.success, true);
  });

  test("Çok kısa isimleri (<2 karakter) reddetmelidir", () => {
    const parsed = ParticipantSchema.safeParse({
      ...validParticipant,
      fullName: "A",
    });
    assert.strictEqual(parsed.success, false);
    assert.match(parsed.error.issues[0].message, /adınızı ve soyadınızı giriniz/);
  });

  test("Geçersiz e-posta adreslerini reddetmelidir", () => {
    const invalidEmails = [
      "gecersiz",
      "test@",
      "@domain.com",
      "test@domain",
      "test..user@domain.com",
      "",
    ];

    for (const email of invalidEmails) {
      const parsed = ParticipantSchema.safeParse({
        ...validParticipant,
        email,
      });
      assert.strictEqual(
        parsed.success,
        false,
        `E-posta '${email}' geçersiz sayılmalıydı ancak geçti.`
      );
    }
  });

  test("KVKK / Ses işleme onayının verilmemesini (consentGiven=false) engellemelidir", () => {
    const parsed = ParticipantSchema.safeParse({
      ...validParticipant,
      consentGiven: false,
    });
    assert.strictEqual(parsed.success, false);
    assert.match(parsed.error.issues[0].message, /araştırma ve ses işleme onayını vermelisiniz/);
  });

  test("Honeypot alanı doldurulduğunda bot olarak reddetmelidir", () => {
    const parsed = ParticipantSchema.safeParse({
      ...validParticipant,
      honeypot: "spam_bot_input",
    });
    assert.strictEqual(parsed.success, false);
    assert.match(parsed.error.issues[0].message, /Bot aktivitesi tespit edildi/);
  });

  test("LinkedIn URL boş veya geçerli bir URL formatında olmalıdır", () => {
    const validEmpty = ParticipantSchema.safeParse({
      ...validParticipant,
      linkedinUrl: "",
    });
    assert.strictEqual(validEmpty.success, true);

    const invalidUrl = ParticipantSchema.safeParse({
      ...validParticipant,
      linkedinUrl: "not-a-valid-url",
    });
    assert.strictEqual(invalidUrl.success, false);
  });
});

describe("Validation: Feedback Schema (Zod)", () => {
  test("Geçerli 1-5 yıldız aralığındaki değerlendirmeleri onaylamalıdır", () => {
    for (let star = 1; star <= 5; star++) {
      const parsed = FeedbackSchema.safeParse({
        rating: star,
        tags: ["Hızlı", "Kolay"],
        notes: "Geri bildirim notu",
      });
      assert.strictEqual(parsed.success, true);
    }
  });

  test("1'den küçük veya 5'ten büyük derecelendirmeleri reddetmelidir", () => {
    const belowMin = FeedbackSchema.safeParse({ rating: 0, tags: [] });
    assert.strictEqual(belowMin.success, false);

    const aboveMax = FeedbackSchema.safeParse({ rating: 6, tags: [] });
    assert.strictEqual(aboveMax.success, false);
  });
});
