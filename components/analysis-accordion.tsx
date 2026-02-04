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
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#FF5C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[15px] font-semibold text-[#E4E4E7]">Detected Manipulation Tactics</span>
        </div>
        <span className="px-2.5 py-1 bg-[#18181B] rounded-md text-[#71717A] font-mono text-[12px]">
          {tactics.length} found
        </span>
      </div>

      {/* Tactics - All expanded */}
      <div className="space-y-3">
        {sortedTactics.map((tactic, idx) => {
          const originalIndex = tactics.indexOf(tactic);
          const colors = severityColors[tactic.severity];

          return (
            <div
              key={idx}
              className="bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23] rounded-xl p-4 sm:p-5"
              onMouseEnter={() => onTacticHover(originalIndex)}
              onMouseLeave={() => onTacticHover(null)}
            >
              {/* Tactic Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span className="text-[16px] font-semibold text-[#E4E4E7]">
                    {tactic.name}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {tactic.severity.toUpperCase()}
                </span>
              </div>

              {/* Quote */}
              <div className="mb-3">
                <p className="text-[14px] text-[#71717A] mb-1.5">Found in text:</p>
                <div
                  className="px-3 py-2.5 rounded-lg bg-[#0A0A0B] border"
                  style={{ borderColor: `${colors.dot}25` }}
                >
                  <span className="font-mono text-[14px]" style={{ color: colors.text }}>
                    &quot;{tactic.quote}&quot;
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <p className="text-[14px] text-[#71717A] mb-1.5">Why this is manipulative:</p>
                <p className="text-[15px] text-[#D4D4D8] leading-relaxed">
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
