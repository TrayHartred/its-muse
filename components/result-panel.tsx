'use client';

import { AuditResponse } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TacticCard } from './tactic-card';
import { CopyButton } from './copy-button';

interface ResultPanelProps {
  result: AuditResponse;
  highlightedTactic: number | null;
}

export function ResultPanel({ result, highlightedTactic }: ResultPanelProps) {
  if (!result.hasTactics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600 dark:text-green-400">No Manipulation Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600 dark:text-orange-400">
            {result.tactics.length} Tactic{result.tactics.length !== 1 ? 's' : ''} Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Tactics List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Manipulative Tactics</h3>
        {result.tactics.map((tactic, index) => (
          <TacticCard
            key={index}
            tactic={tactic}
            index={index}
            isHighlighted={highlightedTactic === index}
          />
        ))}
      </div>

      {/* Neutral Rewrite */}
      {result.neutralRewrite && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Neutral Rewrite</CardTitle>
            <CopyButton text={result.neutralRewrite} />
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">
              {result.neutralRewrite}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
