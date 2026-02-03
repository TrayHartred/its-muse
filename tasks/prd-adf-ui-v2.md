# PRD: ADF UI V2 — Speed-First Redesign

## Introduction

Переработка UI для ADF с фокусом на скорость: paste → auto-filter → copy → done. Текущий UI требует дополнительных кликов (кнопка Analyze). Новый UI автоматически запускает фильтрацию при вставке, показывает side-by-side сравнение ORIGINAL/CLEAN, и выделяет кнопку COPY.

**Problem:** Текущий flow требует лишний клик (Analyze) и не показывает явное сравнение до/после.

**Solution:** Auto-filter on paste, responsive side-by-side layout, big COPY button, collapsed analysis, keyboard shortcuts.

## Goals

- Автоматическая фильтрация при вставке текста (Cmd+V)
- Явное сравнение ORIGINAL vs CLEAN side-by-side
- Большая кнопка COPY CLEAN TEXT
- Свёрнутый analysis accordion (не мешает основному flow)
- Keyboard shortcuts: Cmd+V (paste+filter), Cmd+C (copy clean), Esc (reset)
- Responsive: side-by-side на desktop, vertical stack на mobile

## User Stories

### US-001: useAutoCopy Hook
**Description:** As a user, I want my auto-copy preference saved so that I don't need to enable it every session.

**Acceptance Criteria:**
- [ ] `hooks/use-auto-copy.ts` created
- [ ] Reads/writes `adf-auto-copy` from localStorage
- [ ] `copyText(text)` function copies to clipboard and shows toast
- [ ] `showCopiedToast` state auto-hides after 2 seconds
- [ ] Typecheck passes: `npx tsc --noEmit`

### US-002: InputPanel Component
**Description:** As a user, I want to paste text and have it automatically filtered so that I save a click.

**Acceptance Criteria:**
- [ ] `components/input-panel.tsx` created
- [ ] Big textarea (70% viewport height)
- [ ] Auto-filter on paste event (100ms debounce)
- [ ] Clickable example text that triggers filter
- [ ] Shows "⌘V to paste and filter instantly" hint
- [ ] Auto-focuses textarea on mount
- [ ] Typecheck passes

### US-003: ComparisonView Component
**Description:** As a user, I want to see ORIGINAL and CLEAN text side-by-side so that I can compare them.

**Acceptance Criteria:**
- [ ] `components/comparison-view.tsx` created
- [ ] Grid layout: 2 columns on desktop (md:grid-cols-2), 1 column on mobile
- [ ] Left panel: "ORIGINAL" label + highlighted text
- [ ] Right panel: "CLEAN" label + neutral text + big COPY button
- [ ] Button shows "📋 COPY CLEAN TEXT" → "✓ Copied!" on click
- [ ] Typecheck passes

### US-004: AnalysisAccordion Component
**Description:** As a user, I want to see analysis details without them blocking my main task, so that I can focus on the clean text.

**Acceptance Criteria:**
- [ ] `components/analysis-accordion.tsx` created
- [ ] Collapsed by default with severity summary (🔴 X 🟠 Y 🟡 Z)
- [ ] Click to expand shows list of tactics
- [ ] Each tactic is expandable with explanation
- [ ] Hover on tactic highlights it in ORIGINAL panel
- [ ] Tactics sorted by severity (high → medium → low)
- [ ] Typecheck passes

### US-005: CopiedToast Component
**Description:** As a user, I want to see confirmation when text is copied so that I know it worked.

**Acceptance Criteria:**
- [ ] `components/copied-toast.tsx` created
- [ ] Fixed position at bottom center
- [ ] Green background with "✓ Copied to clipboard"
- [ ] Animates in from bottom
- [ ] Auto-hides after 2 seconds
- [ ] Typecheck passes

### US-006: Main Page Rewrite
**Description:** As a user, I want the new speed-first flow so that I can filter and copy text faster.

**Acceptance Criteria:**
- [ ] `app/page.tsx` rewritten with three states: input, loading, result
- [ ] Input state: InputPanel centered, no other UI
- [ ] Loading state: shows pasted text preview with spinner
- [ ] Result state: header with "← New text" + ComparisonView + AnalysisAccordion
- [ ] Auto-copy if setting enabled (AFTER filter completes)
- [ ] Keyboard shortcuts: Cmd+C copies clean text, Esc resets
- [ ] Typecheck passes
- [ ] Verify in browser: full flow works

### US-007: Cleanup Old Components
**Description:** As a developer, I need to remove unused components so that codebase stays clean.

**Acceptance Criteria:**
- [ ] Delete `components/analyze-form.tsx`
- [ ] Delete `components/result-panel.tsx`
- [ ] Delete `components/tactic-card.tsx`
- [ ] Build passes: `npm run build`

### US-008: Update Highlight Colors
**Description:** As a user, I want consistent severity colors so that I can quickly identify severity levels.

**Acceptance Criteria:**
- [ ] Update `components/highlighted-text.tsx` with design spec colors
- [ ] High: `#FF5C33` (red)
- [ ] Medium: `#FF8400` (orange)
- [ ] Low: `#E5D84A` (yellow)
- [ ] Typecheck passes

### US-009: Final Testing
**Description:** As a developer, I need to verify all flows work correctly before shipping.

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual test: paste text → auto-filters
- [ ] Manual test: click example → filters
- [ ] Manual test: Cmd+C → copies clean text
- [ ] Manual test: Esc → returns to input
- [ ] Manual test: mobile view works (< 768px)
- [ ] Manual test: analysis accordion expands/collapses

## Functional Requirements

- FR-1: System must auto-trigger filter on paste event
- FR-2: System must show side-by-side ORIGINAL/CLEAN comparison
- FR-3: System must provide big prominent COPY button in CLEAN panel
- FR-4: System must collapse analysis by default
- FR-5: System must show severity summary in collapsed analysis header
- FR-6: System must support Cmd+C to copy clean text (no selection)
- FR-7: System must support Esc to reset to input state
- FR-8: System must save auto-copy preference in localStorage
- FR-9: System must show toast when text is copied
- FR-10: System must use responsive layout (side-by-side on desktop, vertical on mobile)

## Non-Goals (Out of Scope)

- No changes to API endpoint
- No changes to Grok prompts
- No new backend functionality
- No settings panel (auto-copy is internal for now)

## Technical Considerations

- **Breakpoint:** 768px (md) for responsive switch
- **Colors:** High=#FF5C33, Medium=#FF8400, Low=#E5D84A
- **Animation:** Toast uses Tailwind animate-in
- **State:** Three explicit states: input, loading, result

Reference files:
- `docs/plans/2026-02-03-adf-ui-design.md` — Final UI/UX design spec
- `docs/plans/2026-02-03-adf-ui-v2-implementation.md` — Detailed implementation plan

## Success Metrics

- Clicks to copy clean text: 0 (with auto-copy) or 1 (manual copy)
- Keyboard shortcuts functional: Cmd+V, Cmd+C, Esc
- Mobile/desktop responsive: works on both
- TypeScript: zero errors
