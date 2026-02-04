'use client';

import { Tactic } from '@/lib/schemas';
import { mapTacticsToHighlights, splitTextByHighlights } from '@/lib/highlight-mapper';
import { Theme } from '@/hooks/use-theme';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HighlightedTextProps {
  text: string;
  tactics: Tactic[];
  onTacticHover?: (index: number | null) => void;
  theme?: Theme;
}

const severityColors = {
  low: { bg: 'bg-[#EAB308]/20', hover: 'hover:bg-[#EAB308]/30', text: '#EAB308', border: '#EAB308' },
  medium: { bg: 'bg-[#F59E0B]/20', hover: 'hover:bg-[#F59E0B]/30', text: '#F59E0B', border: '#F59E0B' },
  high: { bg: 'bg-[#EF4444]/20', hover: 'hover:bg-[#EF4444]/30', text: '#EF4444', border: '#EF4444' },
};

export function HighlightedText({ text, tactics, onTacticHover, theme = 'dark' }: HighlightedTextProps) {
  const ranges = mapTacticsToHighlights(text, tactics);
  const segments = splitTextByHighlights(text, ranges);

  // Theme colors
  const tooltipColors = {
    bg: theme === 'dark' ? '#18181B' : '#FFFFFF',
    border: theme === 'dark' ? '#27272A' : '#E5E5E0',
    text: theme === 'dark' ? '#E4E4E7' : '#1A1A1D',
    textSecondary: theme === 'dark' ? '#A1A1AA' : '#52525B',
  };

  return (
    <TooltipProvider delayDuration={200}>
      <span className="whitespace-pre-wrap leading-relaxed">
        {segments.map((segment, i) => {
          if (segment.tacticIndex === undefined) {
            return <span key={i}>{segment.text}</span>;
          }

          const tactic = tactics[segment.tacticIndex];
          const colors = severityColors[tactic.severity];

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span
                  className={`cursor-pointer rounded-md px-1 py-0.5 transition-colors outline-none ${colors.bg} ${colors.hover}`}
                  onMouseEnter={() => onTacticHover?.(segment.tacticIndex!)}
                  onMouseLeave={() => onTacticHover?.(null)}
                  style={{ color: colors.text }}
                >
                  {segment.text}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs p-3 rounded-lg shadow-xl"
                style={{
                  backgroundColor: tooltipColors.bg,
                  borderColor: tooltipColors.border,
                  borderWidth: 1,
                }}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: colors.border }}
                    />
                    <span className="font-medium text-[14px]" style={{ color: tooltipColors.text }}>
                      {tactic.name}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
                      style={{
                        backgroundColor: `${colors.border}20`,
                        color: colors.border
                      }}
                    >
                      {tactic.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: tooltipColors.textSecondary }}>
                    {tactic.explanation}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </span>
    </TooltipProvider>
  );
}
