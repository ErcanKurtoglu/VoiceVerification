import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/services/storage/supabase-client";
import { SurveyConfig } from "@/types/interview";
import { PRINT_IT_RIGHT_SURVEY } from "@/surveys/print-it-right";
import { validateSurveyQuestion } from "@/features/anti-garbage/survey-validator";

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json({ surveys: [PRINT_IT_RIGHT_SURVEY] });
    }

    const { data, error } = await supabaseAdmin
      .from("surveys")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ surveys: [PRINT_IT_RIGHT_SURVEY] });
    }

    const mappedSurveys: SurveyConfig[] = data.map((row) => ({
      id: row.id,
      slug: row.slug || row.id,
      title: row.title,
      tagline: row.tagline,
      description: row.description,
      targetAudience: row.target_audience || "",
      estimatedMinutes: row.estimated_minutes || 3,
      aiContext: row.ai_context || "",
      questions: Array.isArray(row.questions) ? row.questions : [],
    }));

    return NextResponse.json({ surveys: mappedSurveys, raw: data });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase bağlantısı yapılandırılmamış." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      title,
      tagline,
      description,
      targetAudience,
      estimatedMinutes = 3,
      aiContext,
      accessPin,
      questions,
    } = body;

    if (!title || !description || !accessPin || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Başlık, açıklama, PIN kodu ve en az bir soru zorunludur." },
        { status: 400 }
      );
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const validation = validateSurveyQuestion(q);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: `Soru #${i + 1}: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    const cleanPin = accessPin.trim().toUpperCase();
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const surveyId = slug || `survey-${Date.now()}`;

    // PIN benzersizlik denetimi
    const { data: existingPin } = await supabaseAdmin
      .from("surveys")
      .select("id, access_pin")
      .eq("access_pin", cleanPin)
      .maybeSingle();

    if (existingPin && existingPin.id !== surveyId) {
      return NextResponse.json(
        { error: `"${cleanPin}" PIN kodu zaten başka bir anket tarafından kullanılıyor.` },
        { status: 400 }
      );
    }

    const payload = {
      id: surveyId,
      slug: surveyId,
      title: title.trim(),
      tagline: (tagline || "Sektörel Doğrulama").trim(),
      description: description.trim(),
      target_audience: (targetAudience || "").trim(),
      estimated_minutes: Number(estimatedMinutes) || 3,
      ai_context: (aiContext || "").trim(),
      access_pin: cleanPin,
      questions,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabaseAdmin
      .from("surveys")
      .upsert(payload, { onConflict: "id" });

    if (upsertErr) {
      return NextResponse.json(
        { error: "Anket kaydedilirken hata oluştu: " + upsertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      surveyId,
      accessPin: cleanPin,
      survey: payload,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase bağlantısı yapılandırılmamış." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { id, accessPin, title, description, tagline, targetAudience, estimatedMinutes, aiContext } = body;

    if (!id) {
      return NextResponse.json({ error: "Anket ID zorunludur." }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (accessPin) {
      const cleanPin = accessPin.trim().toUpperCase();
      // PIN çakışma kontrolü
      const { data: existingPin } = await supabaseAdmin
        .from("surveys")
        .select("id, access_pin")
        .eq("access_pin", cleanPin)
        .maybeSingle();

      if (existingPin && existingPin.id !== id) {
        return NextResponse.json(
          { error: `"${cleanPin}" PIN kodu zaten başka bir ankete aittir.` },
          { status: 400 }
        );
      }
      updates.access_pin = cleanPin;
    }

    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (tagline) updates.tagline = tagline.trim();
    if (targetAudience !== undefined) updates.target_audience = targetAudience.trim();
    if (estimatedMinutes !== undefined) updates.estimated_minutes = Number(estimatedMinutes);
    if (aiContext !== undefined) updates.ai_context = aiContext.trim();

    const { error } = await supabaseAdmin
      .from("surveys")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: updates });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase bağlantısı yapılandırılmamış." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Silinecek anket ID'si belirtilmedi." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("surveys")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
