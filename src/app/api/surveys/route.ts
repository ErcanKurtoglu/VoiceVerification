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
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ surveys: [PRINT_IT_RIGHT_SURVEY] });
    }

    const mappedSurveys: SurveyConfig[] = data.map((row) => ({
      id: row.id,
      slug: row.slug || row.id,
      title: row.title,
      titleEn: row.title_en || row.titleEn,
      tagline: row.tagline,
      taglineEn: row.tagline_en || row.taglineEn,
      description: row.description,
      descriptionEn: row.description_en || row.descriptionEn,
      caseAnchor: row.case_anchor || row.caseAnchor || row.questions?.[0]?.caseAnchor,
      caseAnchorEn: row.case_anchor_en || row.caseAnchorEn || row.questions?.[0]?.caseAnchorEn,
      targetAudience: row.target_audience || "",
      targetAudienceEn: row.target_audience_en || row.targetAudienceEn,
      estimatedMinutes: row.estimated_minutes || 3,
      aiContext: row.ai_context || "",
      aiContextEn: row.ai_context_en || row.aiContextEn,
      isActive: row.is_active ?? true,
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
      titleEn,
      tagline,
      taglineEn,
      description,
      descriptionEn,
      caseAnchor,
      caseAnchorEn,
      targetAudience,
      targetAudienceEn,
      estimatedMinutes = 3,
      aiContext,
      aiContextEn,
      accessPin,
      questions,
      id: customId,
      slug: customSlug,
    } = body;

    if (!title || !description || !accessPin || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Başlık, açıklama, PIN kodu ve en az bir soru zorunludur." },
        { status: 400 }
      );
    }

    // Attach caseAnchor and caseAnchorEn to questions[0] for persistence
    if (questions[0]) {
      if (caseAnchor) questions[0].caseAnchor = caseAnchor;
      if (caseAnchorEn) questions[0].caseAnchorEn = caseAnchorEn;
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
    const autoSlug = title
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

    const surveyId = customId || customSlug || autoSlug || `survey-${Date.now()}`;
    const finalSlug = customSlug || autoSlug || surveyId;

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

    const payload: Record<string, any> = {
      id: surveyId,
      slug: finalSlug,
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

    if (titleEn) payload.title_en = titleEn.trim();
    if (taglineEn) payload.tagline_en = taglineEn.trim();
    if (descriptionEn) payload.description_en = descriptionEn.trim();
    if (caseAnchor) payload.case_anchor = caseAnchor.trim();
    if (caseAnchorEn) payload.case_anchor_en = caseAnchorEn.trim();
    if (targetAudienceEn) payload.target_audience_en = targetAudienceEn.trim();
    if (aiContextEn) payload.ai_context_en = aiContextEn.trim();

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
    const {
      id,
      accessPin,
      title,
      titleEn,
      description,
      descriptionEn,
      tagline,
      taglineEn,
      caseAnchor,
      caseAnchorEn,
      targetAudience,
      targetAudienceEn,
      estimatedMinutes,
      aiContext,
      aiContextEn,
      isActive,
      questions,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Anket ID zorunludur." }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (isActive !== undefined) {
      updates.is_active = Boolean(isActive);
    }

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
    if (titleEn !== undefined) updates.title_en = titleEn.trim();
    if (description) updates.description = description.trim();
    if (descriptionEn !== undefined) updates.description_en = descriptionEn.trim();
    if (tagline) updates.tagline = tagline.trim();
    if (taglineEn !== undefined) updates.tagline_en = taglineEn.trim();
    if (caseAnchor !== undefined) updates.case_anchor = caseAnchor.trim();
    if (caseAnchorEn !== undefined) updates.case_anchor_en = caseAnchorEn.trim();
    if (targetAudience !== undefined) updates.target_audience = targetAudience.trim();
    if (targetAudienceEn !== undefined) updates.target_audience_en = targetAudienceEn.trim();
    if (estimatedMinutes !== undefined) updates.estimated_minutes = Number(estimatedMinutes);
    if (aiContext !== undefined) updates.ai_context = aiContext.trim();
    if (aiContextEn !== undefined) updates.ai_context_en = aiContextEn.trim();

    if (questions !== undefined && Array.isArray(questions)) {
      if (questions.length === 0) {
        return NextResponse.json({ error: "Ankette en az bir soru bulunmalıdır." }, { status: 400 });
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
      if (caseAnchor && questions[0]) questions[0].caseAnchor = caseAnchor;
      if (caseAnchorEn && questions[0]) questions[0].caseAnchorEn = caseAnchorEn;
      updates.questions = questions;

      const totalSec = questions.reduce((sum: number, q: any) => sum + (Number(q.maxDurationSec) || 60), 0);
      updates.estimated_minutes = Math.max(1, Math.ceil(totalSec / 60));
    }

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
