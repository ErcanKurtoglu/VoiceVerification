import { ParticipantData, TrackingData } from "@/types/interview";

export interface InvitePayload {
  surveyId: string;
  exp: number; // Unix timestamp (ms)
  uid?: string;
  name?: string;
  email?: string;
  company?: string;
  title?: string;
  ref?: string;
}

// Kolay erişim kampanya kodları (Landing page'de veya kısa linklerde girilebilecek kodlar)
export const SURVEY_ACCESS_CODES: Record<string, { surveyId: string; expiresAt: number; title: string }> = {
  "PIR-2026": {
    surveyId: "print-it-right",
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 Gün
    title: "Print It Right Challenge",
  },
  "FOOD-SAFE": {
    surveyId: "print-it-right",
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
  validDays: number = 7
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
 * URL arama parametrelerine göre anket erişim hakkını denetler.
 */
export function evaluateSurveyAccess(
  surveyId: string,
  searchParams: Record<string, string | string[] | undefined>
): {
  isAllowed: boolean;
  reason?: "missing_access" | "expired" | "invalid_code";
  prefilledParticipant?: Partial<ParticipantData>;
  tracking?: TrackingData;
} {
  const token = typeof searchParams.token === "string" ? searchParams.token : undefined;
  const code = typeof searchParams.code === "string" ? searchParams.code.toUpperCase().trim() : undefined;
  const quickN = typeof searchParams.n === "string" ? searchParams.n : undefined;
  const uid = typeof searchParams.uid === "string" ? searchParams.uid : undefined;
  const ref = typeof searchParams.ref === "string" ? searchParams.ref : undefined;

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
      tracking: { uid: `dev_${quickN}`, ref: "dev_shortcut" },
    };
  }

  // 2. Kampanya Erişim Kodu (?code=PIR-2026)
  if (code && SURVEY_ACCESS_CODES[code]) {
    const campaign = SURVEY_ACCESS_CODES[code];
    if (Date.now() > campaign.expiresAt) {
      return { isAllowed: false, reason: "expired" };
    }
    if (campaign.surveyId !== surveyId) {
      return { isAllowed: false, reason: "invalid_code" };
    }
    return {
      isAllowed: true,
      tracking: { ref: `code_${code}` },
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
    if (payload.surveyId !== surveyId) {
      return { isAllowed: false, reason: "missing_access" };
    }

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
      },
    };
  }

  // 4. Doğrudan parametrelerle gelme (?uid=... veya ?name=...)
  // Kurumsal URL yapısı: Eğer en azından bir uid veya ref parametresi varsa geçerli say
  if (uid || ref || searchParams.name) {
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
      },
    };
  }

  // Hiçbir yetki anahtarı yoksa: Doğrudan URL girişini engelle!
  return { isAllowed: false, reason: "missing_access" };
}
