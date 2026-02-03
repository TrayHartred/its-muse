'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface AnalyzeFormProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export function AnalyzeForm({ onAnalyze, isLoading }: AnalyzeFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAnalyze(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to analyze for manipulative tactics..."
        className="min-h-[200px] resize-y"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {text.length} / 10,000 characters
        </span>
        <Button
          type="submit"
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>
    </form>
  );
}
