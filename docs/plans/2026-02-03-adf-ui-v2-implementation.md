# ADF UI V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild ADF UI with auto-filter on paste, big COPY button, responsive side-by-side layout, and keyboard shortcuts.

**Architecture:** Replace current two-panel grid with single-state flow: Input → Loading → Result. Auto-trigger filter on paste event. Store auto-copy preference in localStorage. Use CSS grid for responsive side-by-side (desktop) / vertical (mobile) layout.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui

---

### Task 1: Create useAutoCopy Hook

**Files:**
- Create: `hooks/use-auto-copy.ts`

**Step 1: Create the hook**

```typescript
// hooks/use-auto-copy.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'adf-auto-copy';

export function useAutoCopy() {
  const [autoCopy, setAutoCopy] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setAutoCopy(true);
    }
  }, []);

  // Save to localStorage when changed
  const toggleAutoCopy = useCallback(() => {
    setAutoCopy(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // Copy text and show toast
  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { autoCopy, toggleAutoCopy, copyText, showCopiedToast };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add hooks/use-auto-copy.ts
git commit -m "feat: add useAutoCopy hook for localStorage persistence

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Create InputPanel Component

**Files:**
- Create: `components/input-panel.tsx`

**Step 1: Create the component**

```tsx
// components/input-panel.tsx
'use client';

import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface InputPanelProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const EXAMPLE_TEXT = 'Experts agree you must act now before it\'s too late! The shocking truth they don\'t want you to know is finally coming to light.';

export function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-filter on paste
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && text.trim() && !isLoading) {
        // Small delay to let paste complete
        setTimeout(() => {
          onSubmit(text.trim());
        }, 100);
      }
    };

    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, [onSubmit, isLoading]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleExampleClick = () => {
    if (!isLoading) {
      onSubmit(EXAMPLE_TEXT);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        ADF · Bullshit Filter
      </h1>

      <div className="w-full max-w-2xl mt-8">
        <Textarea
          ref={textareaRef}
          placeholder="Paste text to filter..."
          className="min-h-[300px] resize-none text-base"
          disabled={isLoading}
        />

        <button
          onClick={handleExampleClick}
          disabled={isLoading}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          💡 Try: &quot;{EXAMPLE_TEXT.slice(0, 50)}...&quot;
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ⌘V to paste and filter instantly
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/input-panel.tsx
git commit -m "feat: add InputPanel with auto-filter on paste

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Create ComparisonView Component

**Files:**
- Create: `components/comparison-view.tsx`

**Step 1: Create the component**

```tsx
// components/comparison-view.tsx
'use client';

import { Tactic } from '@/lib/schemas';
import { HighlightedText } from './highlighted-text';
import { Button } from '@/components/ui/button';

interface ComparisonViewProps {
  originalText: string;
  cleanText: string;
  tactics: Tactic[];
  onTacticHover: (index: number | null) => void;
  onCopy: () => void;
  copied: boolean;
}

export function ComparisonView({
  originalText,
  cleanText,
  tactics,
  onTacticHover,
  onCopy,
  copied,
}: ComparisonViewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Original */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          ORIGINAL
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <HighlightedText
            text={originalText}
            tactics={tactics}
            onTacticHover={onTacticHover}
          />
        </div>
      </div>

      {/* Clean */}
      <div className="rounded-lg border bg-card p-4 flex flex-col">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          CLEAN
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-1 mb-4">
          <p className="whitespace-pre-wrap">{cleanText}</p>
        </div>
        <Button
          onClick={onCopy}
          size="lg"
          className="w-full"
        >
          {copied ? '✓ Copied!' : '📋 COPY CLEAN TEXT'}
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/comparison-view.tsx
git commit -m "feat: add ComparisonView with responsive side-by-side layout

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Create AnalysisAccordion Component

**Files:**
- Create: `components/analysis-accordion.tsx`

**Step 1: Create the component**

```tsx
// components/analysis-accordion.tsx
'use client';

import { useState } from 'react';
import { Tactic } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';

interface AnalysisAccordionProps {
  tactics: Tactic[];
  onTacticHover: (index: number | null) => void;
}

const severityEmoji = {
  high: '🔴',
  medium: '🟠',
  low: '🟡',
};

const severityOrder = { high: 0, medium: 1, low: 2 };

export function AnalysisAccordion({ tactics, onTacticHover }: AnalysisAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Count by severity
  const counts = tactics.reduce(
    (acc, t) => {
      acc[t.severity]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  // Sort by severity
  const sortedTactics = [...tactics].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{isOpen ? '▼' : '▸'}</span>
        <span>Analysis</span>
        <span className="flex gap-2 ml-2">
          {counts.high > 0 && <span>🔴 {counts.high}</span>}
          {counts.medium > 0 && <span>🟠 {counts.medium}</span>}
          {counts.low > 0 && <span>🟡 {counts.low}</span>}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 rounded-lg border bg-card p-3 space-y-2">
          {sortedTactics.map((tactic, index) => {
            const originalIndex = tactics.indexOf(tactic);
            const isExpanded = expandedIndex === originalIndex;

            return (
              <div
                key={originalIndex}
                className="rounded border bg-background p-2"
                onMouseEnter={() => onTacticHover(originalIndex)}
                onMouseLeave={() => onTacticHover(null)}
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                  className="flex items-center gap-2 w-full text-left text-sm"
                >
                  <span>{isExpanded ? '▾' : '▸'}</span>
                  <span>{severityEmoji[tactic.severity]}</span>
                  <span className="font-medium">{tactic.name}</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-muted-foreground truncate flex-1">
                    &quot;{tactic.quote.slice(0, 40)}...&quot;
                  </span>
                </button>

                {isExpanded && (
                  <p className="mt-2 pl-8 text-sm text-muted-foreground">
                    {tactic.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/analysis-accordion.tsx
git commit -m "feat: add AnalysisAccordion with severity summary and expandable items

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Create CopiedToast Component

**Files:**
- Create: `components/copied-toast.tsx`

**Step 1: Create the component**

```tsx
// components/copied-toast.tsx
'use client';

interface CopiedToastProps {
  show: boolean;
}

export function CopiedToast({ show }: CopiedToastProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
      ✓ Copied to clipboard
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/copied-toast.tsx
git commit -m "feat: add CopiedToast component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Rewrite Main Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Rewrite page.tsx**

```tsx
// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditResponse } from '@/lib/schemas';
import { InputPanel } from '@/components/input-panel';
import { ComparisonView } from '@/components/comparison-view';
import { AnalysisAccordion } from '@/components/analysis-accordion';
import { CopiedToast } from '@/components/copied-toast';
import { useAutoCopy } from '@/hooks/use-auto-copy';

type AppState = 'input' | 'loading' | 'result';

export default function Home() {
  const [state, setState] = useState<AppState>('input');
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [highlightedTactic, setHighlightedTactic] = useState<number | null>(null);

  const { autoCopy, copyText, showCopiedToast } = useAutoCopy();

  const handleFilter = useCallback(async (text: string) => {
    setState('loading');
    setError(null);
    setOriginalText(text);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Filter failed');
      }

      const data: AuditResponse = await response.json();
      setResult(data);
      setState('result');

      // Auto-copy if enabled
      if (autoCopy && data.neutralRewrite) {
        copyText(data.neutralRewrite);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('input');
    }
  }, [autoCopy, copyText]);

  const handleReset = useCallback(() => {
    setState('input');
    setResult(null);
    setOriginalText('');
    setError(null);
  }, []);

  const handleCopy = useCallback(() => {
    if (result?.neutralRewrite) {
      copyText(result.neutralRewrite);
    }
  }, [result, copyText]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+C in result state copies clean text
      if (e.metaKey && e.key === 'c' && state === 'result' && result?.neutralRewrite) {
        // Only if no text is selected
        const selection = window.getSelection();
        if (!selection || selection.toString() === '') {
          e.preventDefault();
          copyText(result.neutralRewrite);
        }
      }

      // Esc resets to input
      if (e.key === 'Escape' && state === 'result') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, result, copyText, handleReset]);

  // Input state
  if (state === 'input') {
    return (
      <main className="min-h-screen">
        <InputPanel onSubmit={handleFilter} isLoading={false} />
        {error && (
          <p className="text-center text-sm text-destructive mt-4">{error}</p>
        )}
        <CopiedToast show={showCopiedToast} />
      </main>
    );
  }

  // Loading state
  if (state === 'loading') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {originalText.slice(0, 200)}...
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <span>Filtering...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Result state
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-semibold">ADF · Bullshit Filter</h1>
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← New text
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {result && (
          <>
            <ComparisonView
              originalText={originalText}
              cleanText={result.neutralRewrite || originalText}
              tactics={result.tactics}
              onTacticHover={setHighlightedTactic}
              onCopy={handleCopy}
              copied={showCopiedToast}
            />

            {result.tactics.length > 0 && (
              <AnalysisAccordion
                tactics={result.tactics}
                onTacticHover={setHighlightedTactic}
              />
            )}
          </>
        )}
      </div>

      <CopiedToast show={showCopiedToast} />
    </main>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Test in browser**

Run: `npm run dev`
Test:
1. Paste text → auto-filters
2. See side-by-side comparison
3. Click COPY → copies and shows toast
4. Press Esc → returns to input
5. Press Cmd+C in result → copies clean text

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: rewrite main page with new UI flow

- Auto-filter on paste
- Side-by-side comparison view
- Big COPY button
- Keyboard shortcuts (Cmd+C, Esc)
- Collapsed analysis accordion

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Clean Up Old Components

**Files:**
- Delete: `components/analyze-form.tsx`
- Delete: `components/result-panel.tsx`
- Delete: `components/tactic-card.tsx`

**Step 1: Delete unused components**

```bash
rm components/analyze-form.tsx
rm components/result-panel.tsx
rm components/tactic-card.tsx
```

**Step 2: Verify build works**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old components replaced by new UI

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Update Highlight Colors

**Files:**
- Modify: `components/highlighted-text.tsx`

**Step 1: Update severity colors to match design spec**

Change the `severityColors` object:

```tsx
const severityColors = {
  low: 'bg-[#E5D84A]/30 hover:bg-[#E5D84A]/50',
  medium: 'bg-[#FF8400]/30 hover:bg-[#FF8400]/50',
  high: 'bg-[#FF5C33]/30 hover:bg-[#FF5C33]/50',
};
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/highlighted-text.tsx
git commit -m "style: update highlight colors to match design spec

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Final Testing and Build

**Step 1: Run full test suite**

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: All pass

**Step 2: Manual testing**

1. Open http://localhost:3000
2. Test auto-filter on paste
3. Test example click
4. Test Cmd+C shortcut
5. Test Esc shortcut
6. Test mobile view (resize browser < 768px)
7. Verify analysis accordion works

**Step 3: Final commit**

```bash
git add -A
git commit -m "test: verify all UI flows work correctly

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | useAutoCopy hook | `hooks/use-auto-copy.ts` |
| 2 | InputPanel component | `components/input-panel.tsx` |
| 3 | ComparisonView component | `components/comparison-view.tsx` |
| 4 | AnalysisAccordion component | `components/analysis-accordion.tsx` |
| 5 | CopiedToast component | `components/copied-toast.tsx` |
| 6 | Rewrite main page | `app/page.tsx` |
| 7 | Clean up old components | Delete 3 files |
| 8 | Update highlight colors | `components/highlighted-text.tsx` |
| 9 | Final testing | Build + manual test |
