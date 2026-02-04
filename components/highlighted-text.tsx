'use client';

import { Tactic } from '@/lib/schemas';
import { mapTacticsToHighlights, splitTextByHighlights } from '@/lib/highlight-mapper';
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
}

const severityColors = {
  low: { bg: 'bg-[#EAB308]/20', hover: 'hover:bg-[#EAB308]/30', text: '#EAB308', border: '#EAB308' },
  medium: { bg: 'bg-[#F59E0B]/20', hover: 'hover:bg-[#F59E0B]/30', text: '#F59E0B', border: '#F59E0B' },
  high: { bg: 'bg-[#EF4444]/20', hover: 'hover:bg-[#EF4444]/30', text: '#EF4444', border: '#EF4444' },
};

export function HighlightedText({ text, tactics, onTacticHover }: HighlightedTextProps) {
  const ranges = mapTacticsToHighlights(text, tactics);
  const segments = splitTextByHighlights(text, ranges);

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
                className="max-w-sm bg-[#1A1A1D] border-[#2A2A2E] p-4 rounded-xl shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.border }}
                    />
                    <span className="font-semibold text-white">{tactic.name}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                      style={{
                        backgroundColor: `${colors.border}20`,
                        color: colors.border
                      }}
                    >
                      {tactic.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-[#ADADB0] leading-relaxed">
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
