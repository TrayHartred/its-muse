'use client';

import { Tactic } from '@/lib/schemas';
import { mapTacticsToHighlights, splitTextByHighlights } from '@/lib/highlight-mapper';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface HighlightedTextProps {
  text: string;
  tactics: Tactic[];
  onTacticHover?: (index: number | null) => void;
}

const severityColors = {
  low: 'bg-yellow-200/50 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-900',
  medium: 'bg-orange-200/50 hover:bg-orange-200 dark:bg-orange-900/50 dark:hover:bg-orange-900',
  high: 'bg-red-200/50 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900',
};

export function HighlightedText({ text, tactics, onTacticHover }: HighlightedTextProps) {
  const ranges = mapTacticsToHighlights(text, tactics);
  const segments = splitTextByHighlights(text, ranges);

  return (
    <TooltipProvider>
      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {segments.map((segment, i) => {
          if (segment.tacticIndex === undefined) {
            return <span key={i}>{segment.text}</span>;
          }

          const tactic = tactics[segment.tacticIndex];

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span
                  className={`cursor-pointer rounded px-0.5 transition-colors ${severityColors[tactic.severity]}`}
                  onMouseEnter={() => onTacticHover?.(segment.tacticIndex!)}
                  onMouseLeave={() => onTacticHover?.(null)}
                >
                  {segment.text}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{tactic.name}</span>
                    <Badge variant={
                      tactic.severity === 'high' ? 'destructive' :
                      tactic.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {tactic.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tactic.explanation}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
