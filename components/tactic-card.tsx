'use client';

import { Tactic } from '@/lib/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TacticCardProps {
  tactic: Tactic;
  index: number;
  isHighlighted?: boolean;
}

export function TacticCard({ tactic, index, isHighlighted }: TacticCardProps) {
  return (
    <Card className={`transition-all ${isHighlighted ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {index + 1}. {tactic.name}
          </CardTitle>
          <Badge variant={
            tactic.severity === 'high' ? 'destructive' :
            tactic.severity === 'medium' ? 'default' : 'secondary'
          }>
            {tactic.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <blockquote className="border-l-2 border-muted-foreground/50 pl-3 italic text-sm text-muted-foreground">
          &ldquo;{tactic.quote}&rdquo;
        </blockquote>
        <p className="text-sm">{tactic.explanation}</p>
      </CardContent>
    </Card>
  );
}
