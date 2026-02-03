'use client';

import { useState } from 'react';
import { AuditResponse } from '@/lib/schemas';
import { AnalyzeForm } from '@/components/analyze-form';
import { HighlightedText } from '@/components/highlighted-text';
import { ResultPanel } from '@/components/result-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [highlightedTactic, setHighlightedTactic] = useState<number | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setOriginalText(text);
    setResult(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data: AuditResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Arcimun Disclosure Filter
        </h1>
        <p className="mt-2 text-muted-foreground">
          Strip manipulative tactics, guardrails, and hidden framing from any text
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Panel: Input / Original Text */}
        <div className="space-y-4">
          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Input Text</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyzeForm onAnalyze={handleAnalyze} isLoading={isLoading} />
                {error && (
                  <p className="mt-4 text-sm text-destructive">{error}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Original Text</CardTitle>
                <button
                  onClick={() => {
                    setResult(null);
                    setOriginalText(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  &larr; Analyze new text
                </button>
              </CardHeader>
              <CardContent>
                <HighlightedText
                  text={originalText!}
                  tactics={result.tactics}
                  onTacticHover={setHighlightedTactic}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel: Results */}
        <div>
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">
                  Analyzing text for manipulative tactics...
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <ResultPanel
              result={result}
              highlightedTactic={highlightedTactic}
            />
          )}

          {!result && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Paste text and click Analyze to detect manipulative tactics</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
