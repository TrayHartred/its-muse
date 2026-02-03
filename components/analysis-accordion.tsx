'use client';

import { useState } from 'react';
import { Tactic } from '@/lib/schemas';

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
          {sortedTactics.map((tactic) => {
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
                    &quot;{tactic.quote.slice(0, 40)}{tactic.quote.length > 40 ? '...' : ''}&quot;
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
