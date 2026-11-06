# Survey Access & Invitation Governance Rule

Bu kural, VoiceVerification AI projesinde anket erişim kontrolleri, bağlantı geçerlilik süreleri (TTL) ve katılımcı güvenliğini yönetir.

## Mandatory Rules:
1. **Never Allow Unauthenticated Direct Survey Access:**
   - Any access to `/s/[surveyId]` must validate an invitation token, campaign access code, or tracking parameter via `evaluateSurveyAccess()`.
   - Bare requests without valid authorization must render `AccessDeniedCard` with redirection to `/`.
2. **Time-To-Live (TTL) Enforcement:**
   - Invitation links and campaign codes must have an expiration timestamp (`exp`). Expired links must be rejected.
3. **Landing Page Role:**
   - The root `/` route serves as the central hub presenting the platform, active survey instances, and an access code entry gateway (`KeyRound` verification).
4. **Attribution & Tracking Persistence:**
   - Valid `uid`, `ref`, and `campaign` parameters must be carried into `InterviewSession.tracking` and saved into the storage layer for admin visibility.
