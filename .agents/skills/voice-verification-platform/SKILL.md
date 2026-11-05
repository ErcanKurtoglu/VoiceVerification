---
name: voice-verification-platform
description: >-
  Workflows, guidelines, and commands for developing, testing, and maintaining
  the VoiceVerification AI platform. Use when modifying questions, extending
  the anti-garbage engine, connecting Supabase/Cloudflare storage, or adjusting
  Gemini AI prompt configurations.
---

# VoiceVerification Platform Developer Skill

This skill documents standard operations for extending and debugging the **VoiceVerification AI** web application.

## Key Files & Entry Points

- **Project & Questions Config:** `src/lib/config.ts` (Modify questions, time limits, lead magnet titles, AI context prompt).
- **Audio Capture & RMS Gate:** `src/features/audio/hooks/useAudioRecorder.ts` and `src/features/anti-garbage/audio-energy.ts`.
- **In-Interview AI Assistant:** `src/features/assistant/components/AssistantDrawer.tsx` and `src/app/api/chat/route.ts`.
- **AI Analysis & Sentiment:** `src/services/ai/gemini.ts` and `src/app/api/analyze/route.ts`.
- **Admin Dashboard:** `src/app/admin/page.tsx`.

## Standard Procedures

### 1. Adding or Modifying a Validation Question
Edit `src/lib/config.ts` under `DEFAULT_PROJECT.questions`:
```typescript
{
  id: "q4-pricing-tolerance",
  order: 4,
  title: "Fiyatlandırma & Yatırım İştahı",
  description: "Böyle bir araca aylık bütçe ayırmayı düşünür müydünüz?",
  clarificationHint: "Mevcut anket veya müşteri araştırması bütçenizi düşünebilirsiniz.",
  maxDurationSec: 180,
}
```

### 2. Running Quality & Anti-Garbage Tests
Always execute tests before committing:
```bash
npm test
```

### 3. Production Build Verification
Ensure Turbopack and TypeScript pass without errors:
```bash
npm run build
```

### 4. Running the Development Server
```bash
npm run dev
```
Accessible at `http://localhost:3000` (Interview Flow) and `http://localhost:3000/admin` (Analytics Dashboard).
