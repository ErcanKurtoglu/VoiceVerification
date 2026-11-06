import { SurveyConfig } from "@/types/interview";
import { PRINT_IT_RIGHT_SURVEY } from "./print-it-right";

export const SURVEY_REGISTRY: Record<string, SurveyConfig> = {
  "print-it-right": PRINT_IT_RIGHT_SURVEY,
  "food-safe-parts": PRINT_IT_RIGHT_SURVEY, // Alternatif alias slug
};

export function getSurveyById(id: string): SurveyConfig {
  const normalizedId = id.trim().toLowerCase();
  return SURVEY_REGISTRY[normalizedId] || PRINT_IT_RIGHT_SURVEY;
}

export function getAllSurveys(): SurveyConfig[] {
  // Benzersiz anketleri listeler
  return [PRINT_IT_RIGHT_SURVEY];
}
