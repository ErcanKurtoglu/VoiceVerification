/**
 * Anti-Garbage Modülü: Honeypot & Bot Filtresi
 * Formlara gizlenen ve sadece otomatik spam botlarının dolduracağı alanları denetler.
 */

export function isSpamSubmission(honeypotValue?: string): boolean {
  if (!honeypotValue) return false;
  // Eğer honeypot alanında herhangi bir karakter varsa bu bir spam bottur.
  return honeypotValue.trim().length > 0;
}
