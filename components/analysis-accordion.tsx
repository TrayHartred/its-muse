'use client';

import { Tactic } from '@/lib/schemas';
import { Theme } from '@/hooks/use-theme';

interface AnalysisAccordionProps {
  tactics: Tactic[];
  onTacticHover: (index: number | null) => void;
  theme?: Theme;
}

const severityColors = {
  high: { dot: '#EF4444', bg: '#EF444420', text: '#EF4444' },
  medium: { dot: '#F59E0B', bg: '#F59E0B20', text: '#F59E0B' },
  low: { dot: '#EAB308', bg: '#EAB30820', text: '#EAB308' },
};

const severityOrder = { high: 0, medium: 1, low: 2 };

export function AnalysisAccordion({ tactics, onTacticHover, theme = 'dark' }: AnalysisAccordionProps) {
  // Sort by severity
  const sortedTactics = [...tactics].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  // Theme colors
  const colors = {
    card: theme === 'dark' ? 'rgba(17,17,19,0.9)' : 'rgba(255,255,255,0.9)',
    cardBorder: theme === 'dark' ? '#1F1F23' : '#E5E5E0',
    text: theme === 'dark' ? '#E4E4E7' : '#1A1A1D',
    textExplanation: theme === 'dark' ? '#D4D4D8' : '#3F3F46',
    textMuted: theme === 'dark' ? '#71717A' : '#A1A1AA',
    quoteBg: theme === 'dark' ? '#0A0A0B' : '#FAFAF8',
    badge: theme === 'dark' ? '#18181B' : '#F4F4F5',
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#FF5C00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[15px] font-semibold" style={{ color: colors.text }}>
            Detected Manipulation Tactics
          </span>
        </div>
        <span
          className="px-2.5 py-1 rounded-md font-mono text-[12px]"
          style={{ backgroundColor: colors.badge, color: colors.textMuted }}
        >
          {tactics.length} found
        </span>
      </div>

      {/* Tactics - All expanded */}
      <div className="space-y-3">
        {sortedTactics.map((tactic, idx) => {
          const originalIndex = tactics.indexOf(tactic);
          const tacticColors = severityColors[tactic.severity];

          return (
            <div
              key={idx}
              className="backdrop-blur-sm rounded-xl p-4 sm:p-5 transition-colors duration-300"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
              onMouseEnter={() => onTacticHover(originalIndex)}
              onMouseLeave={() => onTacticHover(null)}
            >
              {/* Tactic Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tacticColors.dot }}
                  />
                  <span className="text-[16px] font-semibold" style={{ color: colors.text }}>
                    {tactic.name}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                  style={{ backgroundColor: tacticColors.bg, color: tacticColors.text }}
                >
                  {tactic.severity.toUpperCase()}
                </span>
              </div>

              {/* Quote */}
              <div className="mb-3">
                <p className="text-[14px] mb-1.5" style={{ color: colors.textMuted }}>Found in text:</p>
                <div
                  className="px-3 py-2.5 rounded-lg"
                  style={{
                    backgroundColor: colors.quoteBg,
                    borderWidth: 1,
                    borderColor: `${tacticColors.dot}25`,
                  }}
                >
                  <span className="font-mono text-[14px]" style={{ color: tacticColors.text }}>
                    &quot;{tactic.quote}&quot;
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <p className="text-[14px] mb-1.5" style={{ color: colors.textMuted }}>Why this is manipulative:</p>
                <p className="text-[15px] leading-relaxed" style={{ color: colors.textExplanation }}>
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
