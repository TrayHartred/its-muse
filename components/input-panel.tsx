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
        ADF &middot; Bullshit Filter
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
          Try: &quot;{EXAMPLE_TEXT.slice(0, 50)}...&quot;
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Cmd+V to paste and filter instantly
        </p>
      </div>
    </div>
  );
}
