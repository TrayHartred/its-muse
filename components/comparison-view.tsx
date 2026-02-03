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
          {copied ? '✓ Copied!' : 'COPY CLEAN TEXT'}
        </Button>
      </div>
    </div>
  );
}
