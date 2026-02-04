'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditResponse } from '@/lib/schemas';
import { InputPanel } from '@/components/input-panel';
import { ComparisonView } from '@/components/comparison-view';
import { AnalysisAccordion } from '@/components/analysis-accordion';
import { CopiedToast } from '@/components/copied-toast';
import { AmbientBackground } from '@/components/ambient-background';
import { BackgroundPicker } from '@/components/background-picker';
import { useAutoCopy } from '@/hooks/use-auto-copy';
import { useBackground } from '@/hooks/use-background';

type AppState = 'input' | 'loading' | 'result';

export default function Home() {
  const [state, setState] = useState<AppState>('input');
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [, setHighlightedTactic] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { autoCopy, copyText, showCopiedToast } = useAutoCopy();
  const { background, setBackground, isLoaded } = useBackground();

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

  const handleRegenerate = useCallback(async () => {
    if (!result || !originalText || isRegenerating) return;

    setIsRegenerating(true);
    // Clear the text first for fade-out effect
    setResult(prev => prev ? { ...prev, neutralRewrite: '' } : null);

    try {
      const response = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText,
          tacticNames: result.tactics.map(t => t.name),
          previousRewrite: result.neutralRewrite || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate');
      }

      // Stream the response character by character
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setResult(prev => prev ? { ...prev, neutralRewrite: fullText } : null);
      }
    } catch (err) {
      console.error('Regenerate error:', err);
    } finally {
      setIsRegenerating(false);
    }
  }, [result, originalText, isRegenerating]);

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
      <main className="min-h-screen relative">
        {isLoaded && <AmbientBackground type={background} />}
        <div className="relative z-10">
          <InputPanel onSubmit={handleFilter} isLoading={false} />
          {error && (
            <p className="text-center text-sm text-destructive mt-4">{error}</p>
          )}
        </div>
        <CopiedToast show={showCopiedToast} />
        {isLoaded && <BackgroundPicker current={background} onChange={setBackground} />}
      </main>
    );
  }

  // Loading state
  if (state === 'loading') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        {isLoaded && <AmbientBackground type={background} />}
        <div className="w-full max-w-2xl relative z-10">
          <div className="bg-[#111113]/95 backdrop-blur-sm border border-[#1F1F23] rounded-2xl p-8">
            <p className="text-[#ADADB0] mb-6 line-clamp-3 text-base leading-relaxed">
              {originalText.slice(0, 200)}{originalText.length > 200 ? '...' : ''}
            </p>
            <div className="flex items-center justify-center gap-3 text-[#FF5C00]">
              <div className="animate-spin h-5 w-5 border-2 border-[#FF5C00] border-t-transparent rounded-full" />
              <span className="font-medium">Analyzing...</span>
            </div>
          </div>
        </div>
        {isLoaded && <BackgroundPicker current={background} onChange={setBackground} />}
      </main>
    );
  }

  // Result state
  return (
    <main className="min-h-screen relative">
      {isLoaded && <AmbientBackground type={background} />}

      {/* Header */}
      <header className="border-b border-[#1F1F23] bg-[#0A0A0B]/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-lg font-bold tracking-wider font-mono text-white">Muse</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]" />
            <span className="text-base sm:text-lg font-light text-[#6B6B70]">Filter</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1A1A1D] hover:bg-[#2A2A2E] border border-[#2A2A2E] rounded-lg text-[#ADADB0] text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Analyze new
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-20 sm:pb-8 relative z-10">
        {result && (
          <>
            <ComparisonView
              originalText={originalText}
              cleanText={result.neutralRewrite || originalText}
              tactics={result.tactics}
              onTacticHover={setHighlightedTactic}
              onCopy={handleCopy}
              copied={showCopiedToast}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
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
      {isLoaded && <BackgroundPicker current={background} onChange={setBackground} />}
    </main>
  );
}
