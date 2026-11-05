<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# VoiceVerification Project Architecture & Governance Rules

This file defines the mandatory engineering, cybersecurity, privacy, UI/UX, and anti-garbage guidelines for the **VoiceVerification AI** platform.

---

## 1. Core Engineering & Architecture Rules
- **Modular Directory Structure (Feature-Driven):**
  - All new capabilities must belong to `src/features/<feature-name>`.
  - Subdomains: `features/audio`, `features/anti-garbage`, `features/assistant`, `features/interview`, `features/feedback`.
- **Strict Typing & Runtime Validation:**
  - TypeScript strict mode must remain enabled with zero `any` types.
  - All incoming/outgoing API parameters and participant submissions must be validated using `zod` schemas in `src/types/interview.ts`.
- **Provider & Adapter Pattern:**
  - AI calls and storage operations must use interface adapters (`src/services/ai/interface.ts`, `src/services/storage/interface.ts`).
  - Never couple components directly to external SDKs. If API keys are missing, always provide functional fallbacks (e.g. `MockAIService`).
- **Session Resilience:**
  - Active participant sessions must sync with local storage drafts to survive page refreshes or connection drops.

---

## 2. Anti-Garbage & Data Integrity Engine (Mandatory)
To prevent the database, analytics, and AI quota from being polluted with junk or spam, all submissions must pass these 4 layers:
1. **Client-Side Audio Gate (`src/features/anti-garbage/audio-energy.ts`):**
   - Minimum duration: >= 3 seconds.
   - Root Mean Square (RMS) audio energy: Must exceed silence floor (> 0.015 RMS).
   - Recordings failing these rules must be blocked at the client level before upload.
2. **Bot & Honeypot Protection (`src/features/anti-garbage/honeypot.ts`):**
   - Hidden inputs must remain empty. Populated honeypots must be silently rejected.
3. **AI Sanity & Relevance Check:**
   - LLM analysis must output `isJunk: boolean`. Any flagged troll/noise submission is marked in the admin review queue and excluded from public benchmark reports.
4. **Abandoned Draft Cleanup:**
   - Incomplete drafts older than 24 hours must be pruned.

---

## 3. UI / UX & Accessibility Standards
- **Voice-First with Text Parity:**
  - Voice recording is the primary action, but a text alternative ("Yazarak Yanıtla") must always be present and equally supported.
- **Psychological Safety & Re-record:**
  - Users must have the ability to review, play back, and delete their recording before finalizing.
- **Accessibility (WCAG 2.1 AA):**
  - Keyboard accessible controls (Space to record/stop, Enter to advance).
  - Explicit ARIA live regions and labels for screen readers.
- **One Question at a Time:**
  - Keep cognitive load minimal. Single active card view with clear step indicators.

---

## 4. Cybersecurity & Defensive Coding
- **Zero-Trust Client:**
  - `GEMINI_API_KEY` and secret database credentials must NEVER be exposed to the client bundle. All AI and persistence requests route through secure Next.js API endpoints (`/api/chat`, `/api/analyze`).
- **File Upload Restrictions:**
  - Accepted MIME types: `audio/webm`, `audio/mp4`, `audio/ogg`, `audio/wav`.
  - Max audio file size: 10 MB. Max duration: 180 seconds.
  - Generate non-deterministic UUIDv4 filenames for any stored asset.
- **Rate Limiting & Abuse Prevention:**
  - AI Chat drawer is limited to a maximum of 6 message turns per question.

---

## 5. Privacy, KVKK & GDPR Compliance
- **Two-Step Informed Consent:**
  - Explicit checkbox acknowledging voice processing and AI transcription must be confirmed prior to interview entry.
  - Dedicated "KVKK Aydınlatma Metni" modal available on demand.
- **Biometric Data Boundary:**
  - Explicitly inform the participant that audio data is used solely for content transcription and sentiment analysis, NOT for voice biometrics or acoustic identification.
- **Right to Erasure & Deletion:**
  - Audio files must follow retention policies and be purgeable upon request.

---

## 6. Testing Requirements
- Any changes to validation, audio verification, or anti-garbage logic must be accompanied by unit tests in `tests/*.test.mjs`.
- Run tests via `npm test` before concluding major changes.
