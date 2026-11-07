import { SurveyConfig } from "@/types/interview";
import { PRINT_IT_RIGHT_SURVEY } from "./print-it-right";
import { supabaseAdmin, isSupabaseConfigured } from "@/services/storage/supabase-client";

export { PRINT_IT_RIGHT_SURVEY };

export const SURVEY_REGISTRY: Record<string, SurveyConfig> = {
  "print-it-right": PRINT_IT_RIGHT_SURVEY,
  "print-it-right-food-safe-parts": PRINT_IT_RIGHT_SURVEY,
  "food-safe-parts": PRINT_IT_RIGHT_SURVEY,
};

export function getSurveyById(id: string): SurveyConfig {
  const normalizedId = id.trim().toLowerCase();
  return SURVEY_REGISTRY[normalizedId] || PRINT_IT_RIGHT_SURVEY;
}

export async function getSurveyByIdAsync(id: string): Promise<SurveyConfig> {
  const normalizedId = id.trim().toLowerCase();

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("surveys")
        .select("*")
        .or(`id.eq.${normalizedId},slug.eq.${normalizedId}`)
        .maybeSingle();

      if (!error && data) {
        const survey: SurveyConfig = {
          id: data.id,
          slug: data.slug || data.id,
          title: data.title,
          titleEn: data.title_en || data.titleEn,
          tagline: data.tagline,
          taglineEn: data.tagline_en || data.taglineEn,
          description: data.description,
          descriptionEn: data.description_en || data.descriptionEn,
          targetAudience: data.target_audience || "",
          targetAudienceEn: data.target_audience_en || data.targetAudienceEn,
          estimatedMinutes: data.estimated_minutes || 3,
          aiContext: data.ai_context || "",
          aiContextEn: data.ai_context_en || data.aiContextEn,
          isActive: data.is_active ?? true,
          questions: Array.isArray(data.questions) ? data.questions : [],
        };
        SURVEY_REGISTRY[data.id] = survey;
        SURVEY_REGISTRY[survey.slug] = survey;
        return survey;
      }
    } catch {
      // Supabase hatasında fallback
    }
  }

  if (SURVEY_REGISTRY[normalizedId]) {
    return SURVEY_REGISTRY[normalizedId];
  }

  return PRINT_IT_RIGHT_SURVEY;
}

export function getAllSurveys(): SurveyConfig[] {
  return Object.values(SURVEY_REGISTRY).filter(
    (s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx
  );
}
