# ADF UI/UX Design — Final Spec

## Overview

**Product:** Arcimun Disclosure Filter (ADF) — web tool to strip manipulative tactics from text.

**Core Flow:** Paste → Auto-filter → Copy clean text → Done

**Design Principles:**
- Speed first (80% users just want clean copy)
- Analysis available but not in the way
- Minimal clicks, keyboard-friendly

---

## States

### 1. Input State (Empty)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                   ADF · Bullshit Filter                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │  Paste text to filter...                          │  │
│  │                                                   │  │
│  │  💡 Try: "Experts agree you must act now          │  │
│  │     before it's too late!"                        │  │  ← clickable example
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│              ⌘V to paste and filter instantly           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Behavior:**
- Textarea takes 70% viewport height
- On paste (Cmd+V or mouse) → auto-trigger filter
- Clickable example fills textarea and triggers filter
- No character limit shown (unlimited)

---

### 2. Loading State

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │  The shocking truth they don't want you to...  │  │
│  │                                                 │  │
│  │              ⏳ Filtering...                    │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Behavior:**
- Show pasted text with subtle loading overlay
- "Filtering..." centered with spinner
- ~2-5 seconds typical

---

### 3. Result State (Desktop — Side-by-Side)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ADF · Bullshit Filter                                    [← New text]       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ ORIGINAL ─────────────────────┐  ┌─ CLEAN ─────────────────────────────┐ │
│  │                                │  │                                     │ │
│  │  The [shocking truth they      │  │  New information is emerging that   │ │
│  │  don't want you to know] is    │  │  some researchers find significant. │ │
│  │  finally coming to light.      │  │                                     │ │
│  │                                │  │  While some experts have weighed    │ │
│  │  While [experts unanimously    │  │  in on the topic, mainstream        │ │
│  │  agree] that this changes      │  │  coverage has been limited.         │ │
│  │  everything, mainstream media  │  │                                     │ │
│  │  [refuses to report on it].    │  │  The evidence is being evaluated,   │ │
│  │                                │  │  and the implications are being     │ │
│  │  The evidence is overwhelming, │  │  discussed.                         │ │
│  │  and the implications are      │  │                                     │ │
│  │  staggering. We need to act    │  │                                     │ │
│  │  now before it's too late.     │  │                                     │ │
│  │                                │  │                                     │ │
│  └────────────────────────────────┘  │      [ 📋 COPY CLEAN TEXT ]         │ │
│                                      └─────────────────────────────────────┘ │
│                                                                              │
│  ✓ Copied to clipboard                              (if auto-copy enabled)   │
│                                                                              │
│  ▼ Analysis (🔴 1 High  🟠 2 Medium  🟡 1 Low)                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- ORIGINAL: highlights manipulative phrases in color-coded brackets
- CLEAN: filtered text with BIG primary "COPY CLEAN TEXT" button
- Auto-copy toast if setting enabled
- Analysis collapsed by default with severity summary
- `[← New text]` resets to input state

---

### 4. Result State (Mobile — Vertical Stack)

```
┌─────────────────────────────────┐
│  ADF          [← New]           │
├─────────────────────────────────┤
│  ORIGINAL                       │
│  ┌───────────────────────────┐  │
│  │ The [shocking truth...]   │  │
│  │ While [experts agree...]  │  │
│  └───────────────────────────┘  │
│              ↓                  │
│  CLEAN                          │
│  ┌───────────────────────────┐  │
│  │ New information is        │  │
│  │ emerging that some...     │  │
│  │                           │  │
│  │  [ 📋 COPY CLEAN TEXT ]   │  │
│  └───────────────────────────┘  │
│                                 │
│  ✓ Copied to clipboard          │
│                                 │
│  ▼ Analysis (🔴1 🟠2 🟡1)       │
└─────────────────────────────────┘
```

---

### 5. Analysis Expanded

```
│  ▼ Analysis (🔴 1 High  🟠 2 Medium  🟡 1 Low)                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ▸ 🔴 Fear Appeal — "shocking truth they don't want you to know"         ││
│  │ ▸ 🟠 Appeal to Authority — "experts unanimously agree"                  ││
│  │ ▸ 🟠 False Urgency — "act now before it's too late"                     ││
│  │ ▸ 🟡 Media Distrust — "refuses to report on it"                         ││
│  └──────────────────────────────────────────────────────────────────────────┘│
```

**On tactic click → expand with explanation:**
```
│  ▾ 🔴 Fear Appeal — "shocking truth they don't want you to know"           │
│    Creates urgency through vague threats and implies a cover-up without    │
│    citing evidence. Triggers emotional response over rational evaluation.  │
```

**Hover sync:** When hovering a tactic, highlight it in ORIGINAL panel.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+V` (empty state) | Paste + auto-filter |
| `Cmd+C` (result state) | Copy clean text |
| `Esc` | Reset to new text |

---

## Settings

- **Auto-copy:** Toggle to automatically copy clean text to clipboard on filter complete
- Stored in localStorage
- Default: OFF (explicit copy is clearer for first-time users)

---

## Color Coding (Severity)

| Severity | Color | Hex |
|----------|-------|-----|
| High | Red | `#FF5C33` |
| Medium | Orange | `#FF8400` |
| Low | Yellow | `#E5D84A` |

---

## Component Hierarchy

```
<App>
  <Header />                    # Logo + "New text" button (result state)

  # Input State:
  <InputPanel>
    <Textarea />
    <ExamplePrompt />           # Clickable example
  </InputPanel>

  # Result State:
  <ResultPanel>
    <ComparisonView>            # Side-by-side (desktop) or stacked (mobile)
      <OriginalText />          # With highlights
      <CleanText />             # With big COPY button
    </ComparisonView>
    <CopiedToast />             # If auto-copy
    <AnalysisAccordion>
      <SeveritySummary />       # 🔴1 🟠2 🟡1
      <TacticsList />           # Expandable items
    </AnalysisAccordion>
  </ResultPanel>
</App>
```

---

## Implementation Notes

1. **Auto-filter on paste:** Listen for `paste` event on textarea, trigger filter after 100ms debounce
2. **Keyboard shortcuts:** Use `useEffect` with `keydown` listener, check for meta key
3. **Responsive breakpoint:** 768px — below is mobile (vertical stack)
4. **Highlight sync:** Use React state to track hovered tactic index, apply CSS class to matching highlight
5. **Auto-copy setting:** Store in localStorage, read on mount
