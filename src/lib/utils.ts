import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Katılımcı tracking ve URL eşleştirmesi için okunaklı, kısa benzersiz UID üretir (Örn: usr_7a9f2b1c).
 */
export function generateShortId(prefix: string = "usr"): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let hash = "";
  for (let i = 0; i < 8; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${hash}`;
}

/**
 * Katılımcının girdiği rol/unvan bilgisini temizler.
 * Boş, anlamsız veya rastgele tuşlama (keyboard mash) durumlarında güvenli ve temiz bir fallback döner.
 */
export function getSanitizedParticipantRole(rawRole?: string, lang: "tr" | "en" = "tr"): string {
  if (!rawRole) {
    return lang === "en" ? "Domain Expert / Participant" : "Saha Uzmanı / Katılımcı";
  }
  const clean = rawRole.trim();
  const MASH_PATTERNS = /(asdasd|asdf|qwerty|zxcvbn|1234)/i;
  if (
    clean.length < 2 ||
    MASH_PATTERNS.test(clean.toLowerCase()) ||
    /^(.)\1{2,}$/.test(clean) ||
    clean === "---" ||
    clean === "..."
  ) {
    return lang === "en" ? "Domain Expert / Participant" : "Saha Uzmanı / Katılımcı";
  }
  return clean;
}
