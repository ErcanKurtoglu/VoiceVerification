import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/services/storage/supabase-client";
import { generateInviteToken, SURVEY_ACCESS_CODES } from "@/services/invitation/token";
import { generateShortId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      surveyId,
      fullName,
      email,
      company,
      title,
      validDays = 7,
      accessPin,
      mode = "participant", // "admin" | "participant"
    } = body;

    if (!surveyId || !email || !fullName) {
      return NextResponse.json(
        { error: "Anket, isim ve e-posta zorunludur." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanCompany = (company || "").trim();
    const cleanTitle = (title || "").trim();

    // 1. Katılımcı PIN ile giriş yapıyorsa PIN doğrulaması
    if (mode === "participant") {
      const cleanPin = (accessPin || "").trim().toUpperCase();
      const validPins = Object.keys(SURVEY_ACCESS_CODES);

      if (!cleanPin || !validPins.includes(cleanPin)) {
        return NextResponse.json(
          { error: "Geçersiz veya yetkisiz erişim kodu (PIN)." },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    // 2. Supabase üzerinde bu (survey_id, email) için süresi dolmamış aktif bir token var mı?
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data: existingInvites, error: queryErr } = await supabaseAdmin
        .from("survey_invites")
        .select("*")
        .eq("survey_id", surveyId)
        .eq("email", cleanEmail)
        .gt("expires_at", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (!queryErr && existingInvites && existingInvites.length > 0) {
        const existing = existingInvites[0];
        const existingUrl = `/s/${surveyId}?token=${existing.token}`;

        return NextResponse.json({
          success: true,
          token: existing.token,
          url: existingUrl,
          expiresAt: existing.expires_at,
          isExisting: true,
          message: "Mevcut aktif oturum ve takip bağlantınız geri yüklendi.",
        });
      }
    }

    // 3. Aktif davetiye yoksa yeni bir süre kısıtlı token üret
    const uid = generateShortId("usr");
    const token = generateInviteToken(
      surveyId,
      {
        fullName: cleanName,
        email: cleanEmail,
        company: cleanCompany,
        title: cleanTitle,
      },
      { uid, ref: mode === "admin" ? "admin_invite" : `pin_${accessPin}` },
      Number(validDays) || 7
    );

    const expiresAt = new Date(Date.now() + (Number(validDays) || 7) * 24 * 60 * 60 * 1000).toISOString();

    // 4. Supabase'e kaydet (Takip ve Garbage-Free Yapı)
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { error: insertErr } = await supabaseAdmin.from("survey_invites").insert({
        survey_id: surveyId,
        token,
        email: cleanEmail,
        full_name: cleanName,
        company: cleanCompany,
        title: cleanTitle,
        access_pin: accessPin || null,
        expires_at: expiresAt,
      });

      if (insertErr) {
        console.error("[InviteAPI] Supabase kayıt hatası:", insertErr);
      }
    }

    const generatedUrl = `/s/${surveyId}?token=${token}`;

    return NextResponse.json({
      success: true,
      token,
      url: generatedUrl,
      expiresAt,
      isExisting: false,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Davetiye işlemi sırasında hata oluştu: " + err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get("surveyId") || undefined;

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json({ invites: [] });
    }

    let query = supabaseAdmin
      .from("survey_invites")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (surveyId) {
      query = query.eq("survey_id", surveyId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invites: data || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
