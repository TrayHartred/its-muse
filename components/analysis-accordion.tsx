'use client';

import { Tactic } from '@/lib/schemas';

interface AnalysisAccordionProps {
  tactics: Tactic[];
  onTacticHover: (index: number | null) => void;
}

const severityColors = {
  high: { dot: '#EF4444', bg: '#EF444420', text: '#EF4444' },
  medium: { dot: '#F59E0B', bg: '#F59E0B20', text: '#F59E0B' },
  low: { dot: '#EAB308', bg: '#EAB30820', text: '#EAB308' },
};

const severityOrder = { high: 0, medium: 1, low: 2 };

export function AnalysisAccordion({ tactics, onTacticHover }: AnalysisAccordionProps) {
  // Sort by severity
  const sortedTactics = [...tactics].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#FF5C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-lg font-semibold text-white">Detected Manipulation Tactics</span>
        </div>
        <span className="px-3 py-1.5 bg-[#1A1A1D] rounded-lg text-[#ADADB0] font-mono text-sm">
          {tactics.length} found
        </span>
      </div>

      {/* Tactics - All expanded */}
      <div className="space-y-4">
        {sortedTactics.map((tactic, idx) => {
          const originalIndex = tactics.indexOf(tactic);
          const colors = severityColors[tactic.severity];

          return (
            <div
              key={idx}
              className="bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23] rounded-2xl p-6"
              onMouseEnter={() => onTacticHover(originalIndex)}
              onMouseLeave={() => onTacticHover(null)}
            >
              {/* Tactic Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span className="text-xl font-semibold text-white">
                    {tactic.name}
                  </span>
                </div>
                <span
                  className="px-3 py-1 rounded-md text-xs font-bold tracking-wide"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {tactic.severity.toUpperCase()}
                </span>
              </div>

              {/* Quote */}
              <div className="mb-4">
                <p className="text-sm text-[#6B6B70] mb-2">Found in text:</p>
                <div
                  className="px-5 py-4 rounded-xl bg-[#0A0A0B] border"
                  style={{ borderColor: `${colors.dot}33` }}
                >
                  <span className="font-mono text-base" style={{ color: colors.text }}>
                    &quot;{tactic.quote}&quot;
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <p className="text-sm text-[#6B6B70] mb-2">Why this is manipulative:</p>
                <p className="text-base text-[#ADADB0] leading-relaxed">
                  {tactic.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
