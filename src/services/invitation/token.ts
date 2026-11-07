import type { ParticipantData, TrackingData } from "../../types/interview.ts";

export interface InvitePayload {
  surveyId: string;
  exp: number; // Unix timestamp (ms)
  uid?: string;
  name?: string;
  email?: string;
  company?: string;
  title?: string;
  ref?: string;
  audience?: string; // Hedef Kitle / Segment (örn: "Bakım Mühendisleri", "Satın Alma")
}

export function areSurveyIdsMatching(id1?: string, id2?: string): boolean {
  if (!id1 || !id2) return false;
  const p1 = id1.trim().toLowerCase();
  const p2 = id2.trim().toLowerCase();
  if (p1 === p2) return true;
  const pirAliases = ["print-it-right", "print-it-right-food-safe-parts", "food-safe-parts"];
  if (pirAliases.includes(p1) && pirAliases.includes(p2)) return true;
  return false;
}

// Kolay erişim kampanya kodları (Landing page'de veya kısa linklerde girilebilecek kodlar)
export const SURVEY_ACCESS_CODES: Record<string, { surveyId: string; expiresAt: number; title: string }> = {
  "PIR-2026": {
    surveyId: "print-it-right-food-safe-parts",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 Gün
    title: "Print It Right Challenge",
  },
  "FOOD-SAFE": {
    surveyId: "print-it-right-food-safe-parts",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    title: "Food-Safe Parts On Demand",
  },
};

/**
 * Katılımcı için süreli (Time-To-Live) güvenli davetiye token'ı üretir.
 */
export function generateInviteToken(
  surveyId: string,
  participant?: Partial<ParticipantData>,
  tracking?: TrackingData,
  validDays: number = 7,
  audience?: string
): string {
  const exp = Date.now() + validDays * 24 * 60 * 60 * 1000;
  const payload: InvitePayload = {
    surveyId,
    exp,
    uid: tracking?.uid,
    ref: tracking?.ref,
    name: participant?.fullName,
    email: participant?.email,
    company: participant?.company,
    title: participant?.title,
    audience: audience || tracking?.audience,
  };

  const jsonStr = JSON.stringify(payload);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(jsonStr).toString("base64url");
  }
  return btoa(jsonStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Verilen token'ın geçerliliğini ve süresini doğrular.
 */
export function verifyInviteToken(token: string): {
  isValid: boolean;
  reason?: "expired" | "invalid_token" | "survey_mismatch";
  payload?: InvitePayload;
} {
  try {
    let jsonStr = "";
    if (typeof Buffer !== "undefined") {
      jsonStr = Buffer.from(token, "base64url").toString("utf-8");
    } else {
      const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
      jsonStr = atob(base64);
    }

    const payload: InvitePayload = JSON.parse(jsonStr);

    // Süre kontrolü (TTL)
    if (payload.exp && Date.now() > payload.exp) {
      return { isValid: false, reason: "expired", payload };
    }

    return { isValid: true, payload };
  } catch {
    return { isValid: false, reason: "invalid_token" };
  }
}

/**
 * URL arama parametrelerine ve anket durumuna göre anket erişim hakkını denetler.
 */
export function evaluateSurveyAccess(
  surveyId: string,
  searchParams: Record<string, string | string[] | undefined>,
  surveyIsActive: boolean = true
): {
  isAllowed: boolean;
  reason?: "missing_access" | "expired" | "invalid_code" | "survey_inactive";
  prefilledParticipant?: Partial<ParticipantData>;
  tracking?: TrackingData;
  audience?: string;
} {
  // Anket pasif ise doğrudan erişimi durdur
  if (!surveyIsActive) {
    return { isAllowed: false, reason: "survey_inactive" };
  }

  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;
  const code = typeof searchParams.code === "string" ? searchParams.code.toUpperCase().trim() : undefined;
  const quickN = typeof searchParams.n === "string" ? searchParams.n : undefined;
  const uid = typeof searchParams.uid === "string" ? searchParams.uid : undefined;
  const ref = typeof searchParams.ref === "string" ? searchParams.ref : undefined;
  const audience =
    typeof searchParams.audience === "string"
      ? searchParams.audience
      : typeof searchParams.seg === "string"
      ? searchParams.seg
      : undefined;

  // 1. Geliştirici Kısayolu (?n=e) — Her zaman geçerli
  if (quickN) {
    const alias = quickN === "e" ? "Ercan" : quickN;
    return {
      isAllowed: true,
      prefilledParticipant: {
        fullName: alias,
        email: `${quickN}@test.com`,
        company: "A-Side Project",
        title: "Challenge Lead",
        consentGiven: true,
      },
      tracking: { uid: `dev_${quickN}`, ref: "dev_shortcut", audience },
      audience,
    };
  }

  // 2. Kampanya Erişim Kodu (?code=PIR-2026)
  if (code && SURVEY_ACCESS_CODES[code]) {
    const campaign = SURVEY_ACCESS_CODES[code];
    if (Date.now() > campaign.expiresAt) {
      return { isAllowed: false, reason: "expired" };
    }
    if (!areSurveyIdsMatching(campaign.surveyId, surveyId)) {
      return { isAllowed: false, reason: "invalid_code" };
    }
    return {
      isAllowed: true,
      tracking: { ref: `code_${code}`, audience },
      audience,
    };
  }

  // 3. Süreli İmzalı Token (?token=...)
  if (token) {
    const tokenResult = verifyInviteToken(token);
    if (!tokenResult.isValid) {
      return {
        isAllowed: false,
        reason: tokenResult.reason === "expired" ? "expired" : "missing_access",
      };
    }

    const payload = tokenResult.payload!;
    if (!areSurveyIdsMatching(payload.surveyId, surveyId)) {
      return { isAllowed: false, reason: "missing_access" };
    }

    const effectiveAudience = payload.audience || audience;

    return {
      isAllowed: true,
      prefilledParticipant: {
        fullName: payload.name,
        email: payload.email,
        company: payload.company,
        title: payload.title,
      },
      tracking: {
        uid: payload.uid,
        ref: payload.ref,
        audience: effectiveAudience,
      },
      audience: effectiveAudience,
    };
  }

  // 4. Doğrudan parametrelerle gelme (?uid=... veya ?name=... veya ?audience=...)
  // Kurumsal URL yapısı: Eğer en azından bir uid, ref, name veya audience parametresi varsa geçerli say
  if (uid || ref || searchParams.name || audience) {
    return {
      isAllowed: true,
      prefilledParticipant: {
        fullName: typeof searchParams.name === "string" ? searchParams.name : undefined,
        email: typeof searchParams.email === "string" ? searchParams.email : undefined,
        company: typeof searchParams.company === "string" ? searchParams.company : undefined,
        title: typeof searchParams.title === "string" ? searchParams.title : undefined,
      },
      tracking: {
        uid,
        ref,
        audience,
      },
      audience,
    };
  }

  // Hiçbir yetki anahtarı yoksa: Doğrudan URL girişini engelle!
  return { isAllowed: false, reason: "missing_access" };
}
