/**
 * Survey Question & Content Validation Engine
 * Prevents empty, dummy, gibberish/mash, and unedited template placeholders from being saved as live surveys.
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

/**
 * Detects whether a string is random keyboard mash, gibberish, or meaningless dummy input.
 */
export function isGibberishOrMeaninglessTitle(title: string): { isMeaningless: boolean; reason?: string } {
  const clean = (title || "").trim();
  if (clean.length < 3) {
    return { isMeaningless: true, reason: "Soru başlığı en az 3 karakter olmalıdır." };
  }

  // 1. Extreme repetitive characters like "aaaaa", ".....", "11111"
  if (/(.)\1{3,}/i.test(clean)) {
    return { isMeaningless: true, reason: "Aşırı karakter tekrarı tespit edildi. Lütfen anlamlı bir soru başlığı giriniz." };
  }

  // 2. Multi-word repeated spam like "asd asd asd" or "test test"
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => w.toLowerCase() === words[0].toLowerCase())) {
    return { isMeaningless: true, reason: "Tekrarlanan anlamsız kelime tespit edildi. Lütfen geçerli bir soru konusu giriniz." };
  }

  // 3. Known keyboard mash substrings and home-row / top-row sequences
  const noSpace = clean.replace(/\s+/g, "").toLowerCase();
  const MASH_PATTERNS = [
    /asdasd/i,
    /asdasdgad/i,
    /asdfgh/i,
    /qwerty/i,
    /zxcvbn/i,
    /dfghjk/i,
    /ghjkl/i,
    /qazwsx/i,
    /wsxedc/i,
    /lkjhg/i,
    /mnbvc/i,
  ];
  if (MASH_PATTERNS.some((pat) => pat.test(noSpace))) {
    return {
      isMeaningless: true,
      reason: "Rastgele klavye tuşlaması tespit edildi. Lütfen araştırmaya uygun somut bir soru başlığı giriniz.",
    };
  }

  // 4. Narrow keyboard home-row / top-row mash for single words (e.g. asdasdgad, asddsa, etc.)
  for (const word of words) {
    const letters = word.toLowerCase().replace(/[^a-zğüşıöç]/g, "");
    if (letters.length >= 6) {
      const uniqueChars = new Set(letters.split(""));
      if (/^[asdfghjkl]+$/.test(letters) && uniqueChars.size <= 4) {
        return {
          isMeaningless: true,
          reason: "Anlamsız klavye tuşlaması tespit edildi. Lütfen araştırmaya uygun somut bir soru başlığı giriniz.",
        };
      }
      if (/^[qwertyuiop]+$/.test(letters) && uniqueChars.size <= 4) {
        return {
          isMeaningless: true,
          reason: "Anlamsız klavye tuşlaması tespit edildi. Lütfen araştırmaya uygun somut bir soru başlığı giriniz.",
        };
      }
    }
  }

  // 5. Consonant cluster check (words with >= 4 letters and zero vowels)
  const VOWEL_REGEX = /[aeıioöuü]/i;
  for (const word of words) {
    const letters = word.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
    if (letters.length >= 4 && !VOWEL_REGEX.test(letters)) {
      return {
        isMeaningless: true,
        reason: "Sesli harf içermeyen anlamsız kelime tespit edildi. Lütfen geçerli bir soru başlığı giriniz.",
      };
    }
  }

  // 6. Explicit dummy single words
  const DUMMY_WORDS = new Set([
    "test",
    "deneme",
    "deneme1",
    "test1",
    "asdasd",
    "asdasdgad",
    "dummy",
    "sablon",
    "şablon",
    "örnek",
    "ornek",
    "bla",
    "blabla",
    "xyz",
    "abc",
  ]);
  if (words.length === 1 && DUMMY_WORDS.has(words[0].toLowerCase())) {
    return {
      isMeaningless: true,
      reason: "Taslak veya deneme amaçlı başlık yerine araştırmaya uygun bir soru başlığı giriniz.",
    };
  }

  return { isMeaningless: false };
}

/**
 * Validates a single question title against emptyness, shortness, gibberish/mash, and templates.
 */
export function validateSurveyQuestionTitle(title?: string): { isValid: boolean; error?: string } {
  const cleanTitle = (title || "").trim();
  if (!cleanTitle) {
    return { isValid: false, error: "Soru başlığı boş bırakılamaz." };
  }
  if (cleanTitle.length < 3) {
    return { isValid: false, error: "Soru başlığı çok kısa (en az 3 karakter olmalıdır)." };
  }

  const check = isGibberishOrMeaninglessTitle(cleanTitle);
  if (check.isMeaningless) {
    return {
      isValid: false,
      error: check.reason || "Lütfen geçerli ve araştırmaya uygun bir soru başlığı giriniz.",
    };
  }

  const normalizedTitle = normalizeForPatternCheck(cleanTitle);
  const isTitleTemplate = DUMMY_TEMPLATE_PATTERNS.some((p) => p.test(normalizedTitle));
  if (isTitleTemplate) {
    return {
      isValid: false,
      error: `"${cleanTitle}" şablon veya taslak bir başlıktır. Lütfen gerçek bir soru konusu giriniz.`,
    };
  }

  return { isValid: true };
}

export interface QuestionValidationInput {
  title?: string;
  description?: string;
  clarificationHint?: string;
}

export function validateSurveyQuestion(q: QuestionValidationInput): { isValid: boolean; error?: string } {
  const cleanTitle = (q.title || "").trim();
  const cleanDesc = (q.description || "").trim();

  const titleValidation = validateSurveyQuestionTitle(cleanTitle);
  if (!titleValidation.isValid) {
    return { isValid: false, error: titleValidation.error };
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
