import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/services/storage/supabase-client";
import { generateInviteToken, SURVEY_ACCESS_CODES } from "@/services/invitation/token";
import { generateShortId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      surveyId,
      fullName,
      email,
      company,
      title,
      targetAudience,
      validDays = 7,
      accessPin,
      mode = "participant", // "admin" | "participant"
    } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: "İsim ve e-posta zorunludur." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanCompany = (company || "").trim();
    const cleanTitle = (title || "").trim();
    const cleanPin = (accessPin || "").trim().toUpperCase();

    // 1. PIN ile Giriş: Eğer surveyId verilmediyse veya participant modundaysa, PIN üzerinden surveyId çözümleme
    if (mode === "participant") {
      if (!cleanPin) {
        return NextResponse.json(
          { error: "Lütfen anket erişim kodunuzu (PIN) giriniz." },
          { status: 400 }
        );
      }

      // A) Supabase surveys tablosu kontrolü (Dinamik admin tarafından eklenen güncel anketler)
      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data: surveyRow, error: sErr } = await supabaseAdmin
          .from("surveys")
          .select("id, access_pin, is_active")
          .eq("access_pin", cleanPin)
          .eq("is_active", true)
          .maybeSingle();

        if (!sErr && surveyRow) {
          surveyId = surveyRow.id;
        }
      }

      // B) Statik kod registry fallback kontrolü
      if (!surveyId && SURVEY_ACCESS_CODES[cleanPin]) {
        surveyId = SURVEY_ACCESS_CODES[cleanPin].surveyId;
      }

      if (!surveyId) {
        return NextResponse.json(
          { error: `"${cleanPin}" koduna ait aktif bir anket bulunamadı. Lütfen kontrol ediniz.` },
          { status: 400 }
        );
      }
    }

    if (!surveyId) {
      return NextResponse.json(
        { error: "Anket seçilmelidir." },
        { status: 400 }
      );
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
          surveyId,
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
    const cleanAudience = (targetAudience || "").trim();
    const token = generateInviteToken(
      surveyId,
      {
        fullName: cleanName,
        email: cleanEmail,
        company: cleanCompany,
        title: cleanTitle,
      },
      {
        uid,
        ref: mode === "admin" ? "admin_invite" : `pin_${cleanPin}`,
        audience: cleanAudience || undefined,
      },
      Number(validDays) || 7,
      cleanAudience || undefined
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
        access_pin: cleanPin || null,
        expires_at: expiresAt,
      });

      if (insertErr) {
        console.error("[InviteAPI] Supabase kayıt hatası:", insertErr);
      }
    }

    const generatedUrl = `/s/${surveyId}?token=${token}`;

    return NextResponse.json({
      success: true,
      surveyId,
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
