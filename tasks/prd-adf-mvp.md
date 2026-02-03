# PRD: ADF (Arcimun Disclosure Filter) MVP

## Introduction

Web tool для детекции и визуализации манипуляций в текстах. Пользователь вставляет текст, система анализирует через Grok API с процедурой SAL∴PAA, возвращает список тактик с цитатами и нейтральную перезапись. UI подсвечивает манипулятивные фрагменты в оригинале с tooltip-объяснениями.

**Problem:** LLM-ответы и другие тексты часто содержат скрытые манипуляции (authority plays, urgency, framing). Нужен инструмент для их обнаружения.

**Solution:** Stateless Next.js 15 app с одним API endpoint `/api/audit`, shadcn/ui интерфейс, Vercel deployment.

## Goals

- Анализ текста на манипуляции через Grok API со structured output
- Визуализация тактик: подсветка цитат в оригинале + tooltips
- Нейтральная перезапись текста без манипуляций
- Копирование clean-версии в один клик
- Production deploy на Vercel

## User Stories

### US-001: Project Setup
**Description:** As a developer, I need initialized Next.js 15 project with TypeScript, Tailwind, shadcn/ui so that I can build the application.

**Acceptance Criteria:**
- [ ] Next.js 15 project created with App Router, TypeScript, Tailwind
- [ ] shadcn/ui initialized with components: button, card, textarea, badge, tooltip
- [ ] `.env.local` with `XAI_API_KEY` placeholder
- [ ] `.gitignore` includes `.env.local`
- [ ] Typecheck passes: `npx tsc --noEmit`

### US-002: TypeScript Types and JSON Schema
**Description:** As a developer, I need TypeScript types and JSON schema for Grok structured output so that API responses are type-safe.

**Acceptance Criteria:**
- [ ] `lib/schemas.ts` with `auditResponseSchema` for Grok strict mode
- [ ] TypeScript types: `Tactic`, `AuditResponse`, `AuditRequest`, `AuditError`
- [ ] Severity enum: `'low' | 'medium' | 'high'`
- [ ] Typecheck passes

### US-003: Prompts Module
**Description:** As a developer, I need SAL∴PAA and AUDIT prompts so that Grok is properly configured for manipulation detection.

**Acceptance Criteria:**
- [ ] `lib/prompts.ts` with `SAL_PAA_PROMPT` constant
- [ ] `AUDIT_PROMPT` constant with tactic categories
- [ ] `buildAuditMessage(text)` function combining prompt + user text
- [ ] Prompts match `/prompts/system-prompts.md`
- [ ] Typecheck passes

### US-004: Grok API Client
**Description:** As a developer, I need a Grok API client with retry logic so that analysis requests are reliable.

**Acceptance Criteria:**
- [ ] `lib/xai.ts` with `auditText(text, apiKey)` function
- [ ] Uses model `grok-4-1-fast-non-reasoning`
- [ ] Structured output via `response_format.json_schema`
- [ ] Retry logic: 3 attempts, exponential backoff
- [ ] Timeout: 30 seconds
- [ ] Proper error handling with `GrokAPIError` class
- [ ] Typecheck passes

### US-005: Quote Highlight Mapper
**Description:** As a developer, I need a utility to map tactic quotes to their positions in original text so that UI can highlight them.

**Acceptance Criteria:**
- [ ] `lib/highlight-mapper.ts` with `findQuotePosition(text, quote)` function
- [ ] Fuzzy matching: whitespace normalization, case-insensitive fallback
- [ ] `mapTacticsToHighlights(text, tactics)` returns sorted ranges
- [ ] `splitTextByHighlights(text, ranges)` returns segments for rendering
- [ ] Handles overlapping quotes
- [ ] Typecheck passes

### US-006: API Route
**Description:** As a user, I need a POST endpoint at `/api/audit` so that I can send text for analysis.

**Acceptance Criteria:**
- [ ] `app/api/audit/route.ts` handles POST requests
- [ ] Validates input: text required, max 10000 chars
- [ ] Returns structured JSON matching `AuditResponse` type
- [ ] Returns proper error codes: 400 (bad input), 500 (server error), 502 (upstream error)
- [ ] Edge runtime enabled
- [ ] Test with curl: `curl -X POST localhost:3000/api/audit -H "Content-Type: application/json" -d '{"text":"As experts agree..."}'`

### US-007: Input Form Component
**Description:** As a user, I want a text input form so that I can submit text for analysis.

**Acceptance Criteria:**
- [ ] `components/analyze-form.tsx` with textarea and submit button
- [ ] Character counter showing current/max (10000)
- [ ] Disabled state during loading
- [ ] Button text changes: "Analyze" → "Analyzing..."
- [ ] Typecheck passes
- [ ] Verify in browser: form renders, submit triggers callback

### US-008: Highlighted Text Component
**Description:** As a user, I want manipulative quotes highlighted in my original text so that I can see exactly where the manipulation is.

**Acceptance Criteria:**
- [ ] `components/highlighted-text.tsx` renders text with highlighted segments
- [ ] Severity-based colors: yellow (low), orange (medium), red (high)
- [ ] Tooltip on hover shows tactic name, severity badge, explanation
- [ ] Uses shadcn Tooltip component
- [ ] Typecheck passes
- [ ] Verify in browser: highlights visible, tooltips work on hover

### US-009: Tactic Card Component
**Description:** As a user, I want to see each detected tactic in a card so that I can understand the manipulation.

**Acceptance Criteria:**
- [ ] `components/tactic-card.tsx` shows: name, severity badge, quote, explanation
- [ ] Quote displayed as blockquote
- [ ] Highlighted state when corresponding text is hovered
- [ ] Uses shadcn Card, Badge components
- [ ] Typecheck passes
- [ ] Verify in browser: cards render with all info

### US-010: Result Panel Component
**Description:** As a user, I want a results panel showing all tactics and neutral rewrite so that I can see the full analysis.

**Acceptance Criteria:**
- [ ] `components/result-panel.tsx` shows: summary card, tactics list, neutral rewrite
- [ ] "No Manipulation Detected" state with green title
- [ ] Tactics count in header
- [ ] Neutral rewrite section with Copy button
- [ ] Typecheck passes
- [ ] Verify in browser: both states render correctly

### US-011: Copy Button Component
**Description:** As a user, I want a copy button for the neutral rewrite so that I can use the clean text.

**Acceptance Criteria:**
- [ ] `components/copy-button.tsx` copies text to clipboard
- [ ] Button text changes: "Copy" → "Copied!" for 2 seconds
- [ ] Uses navigator.clipboard API
- [ ] Typecheck passes
- [ ] Verify in browser: clipboard contains copied text

### US-012: Main Page Integration
**Description:** As a user, I want a split-screen layout with input on left and results on right so that I can compare original and analysis.

**Acceptance Criteria:**
- [ ] `app/page.tsx` with two-column grid layout
- [ ] Left: input form (before analysis) → highlighted original (after)
- [ ] Right: placeholder → loading → results
- [ ] "Analyze new text" link to reset state
- [ ] Header with title "Arcimun Disclosure Filter"
- [ ] Error message display
- [ ] Typecheck passes
- [ ] Verify in browser: full flow works end-to-end

### US-013: End-to-End Testing
**Description:** As a developer, I need to verify the complete flow works so that the product is ready for deployment.

**Acceptance Criteria:**
- [ ] API test with manipulative text returns tactics array
- [ ] API test with clean text returns `hasTactics: false`
- [ ] UI test: paste text → click analyze → see highlights → see results
- [ ] UI test: hover highlight → tooltip appears
- [ ] UI test: click copy → text in clipboard
- [ ] Edge cases: empty text (error), long text (error), clean text (no tactics)

### US-014: Production Build and Deploy
**Description:** As a developer, I need to deploy the application to Vercel so that users can access it.

**Acceptance Criteria:**
- [ ] `npm run build` completes without errors
- [ ] Production build works locally: `npm start`
- [ ] Deployed to Vercel: `vercel --prod`
- [ ] `XAI_API_KEY` set in Vercel environment
- [ ] Production URL accessible and functional
- [ ] Full flow works in production

## Functional Requirements

- FR-1: System must send SAL∴PAA procedure as system prompt to Grok
- FR-2: System must send AUDIT prompt + user text as user message
- FR-3: System must use Grok structured output (json_schema) for guaranteed JSON response
- FR-4: System must validate input text (required, max 10000 chars)
- FR-5: System must highlight exact quotes from Grok response in original text
- FR-6: System must show tooltip with tactic info on highlight hover
- FR-7: System must display severity with color coding (low=yellow, medium=orange, high=red)
- FR-8: System must provide neutral rewrite when tactics are found
- FR-9: System must allow copying neutral rewrite to clipboard
- FR-10: System must handle API errors gracefully with user-friendly messages

## Non-Goals (Out of Scope)

- No user authentication or accounts
- No session persistence (stateless)
- No model switcher (single model: grok-4-1-fast-non-reasoning)
- No custom prompt editor
- No history of previous analyses
- No Russian localization (English UI only)
- No streaming responses (wait for full response)
- No database (all analysis is ephemeral)

## Technical Considerations

- **Framework:** Next.js 15 App Router
- **Runtime:** Edge (Vercel)
- **UI:** shadcn/ui + Tailwind CSS
- **API:** xAI Grok (`grok-4-1-fast-non-reasoning`)
- **State:** React useState only (no Zustand)
- **Model pricing:** $0.20/1M input, $0.50/1M output
- **Timeout:** 30 seconds per request
- **Max retries:** 3 with exponential backoff

Reference files:
- `/prompts/system-prompts.md` — SAL∴PAA and AUDIT prompts
- `/docs/PRD.md` — Original requirements
- `/docs/plans/2026-02-03-adf-mvp.md` — Detailed implementation plan

## Success Metrics

- Average time from paste to results: < 5 seconds
- Quote-to-highlight mapping accuracy: 100% (exact matches)
- Zero TypeScript errors in production build
- All user stories have passing acceptance criteria

## Open Questions

- Should we add rate limiting on the API endpoint?
- Should we track anonymous usage analytics?
- Should we add example texts for quick testing?
