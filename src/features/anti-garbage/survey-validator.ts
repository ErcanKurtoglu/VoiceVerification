/**
 * Survey Question & Content Validation Engine
 * Prevents empty, dummy, and unedited template placeholders from being saved as live surveys.
 */

export function normalizeForPatternCheck(str: string): string {
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

export const DUMMY_TEMPLATE_PATTERNS = [
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

export interface QuestionValidationInput {
  title?: string;
  description?: string;
  clarificationHint?: string;
}

export function validateSurveyQuestion(q: QuestionValidationInput): { isValid: boolean; error?: string } {
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
      error: `Soru açıklaması şablon metin içeriyor. Lütfen katılımcıya yöneltilecek gerçek sorunun kapsamını açıklayınız.`,
    };
  }

  return { isValid: true };
}
