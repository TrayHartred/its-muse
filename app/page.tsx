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
  const [, setHighlightedTactic] = useState<number | null>(null);

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
              {originalText.slice(0, 200)}{originalText.length > 200 ? '...' : ''}
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
          <h1 className="font-semibold">ADF &middot; Bullshit Filter</h1>
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; New text
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
