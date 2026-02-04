'use client';

import { Tactic } from '@/lib/schemas';
import { HighlightedText } from './highlighted-text';

interface ComparisonViewProps {
  originalText: string;
  cleanText: string;
  tactics: Tactic[];
  onTacticHover: (index: number | null) => void;
  onCopy: () => void;
  copied: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function ComparisonView({
  originalText,
  cleanText,
  tactics,
  onTacticHover,
  onCopy,
  copied,
  onRegenerate,
  isRegenerating,
}: ComparisonViewProps) {
  // Count by severity
  const counts = tactics.reduce(
    (acc, t) => {
      acc[t.severity]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const total = tactics.length;

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23] rounded-xl px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B6B70]">Found:</span>
            <span className="text-base sm:text-lg font-semibold text-white">{total} {total === 1 ? 'tactic' : 'tactics'}</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-[#2A2A2E]" />
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            {counts.high > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[#EF4444] font-medium">{counts.high} high</span>
              </span>
            )}
            {counts.medium > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[#F59E0B] font-medium">{counts.medium} medium</span>
              </span>
            )}
            {counts.low > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                <span className="text-[#EAB308] font-medium">{counts.low} low</span>
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E] font-medium rounded-lg text-xs sm:text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Original */}
        <div className="bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1F1F23]">
            <svg className="w-4 h-4 text-[#6B6B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium tracking-wide text-[#6B6B70] uppercase">Original</span>
          </div>
          <div className="text-[15px] text-[#C4C4C4] leading-[1.8]">
            <HighlightedText
              text={originalText}
              tactics={tactics}
              onTacticHover={onTacticHover}
            />
          </div>
        </div>

        {/* Clean */}
        <div className="bg-[#111113]/90 backdrop-blur-sm border border-[#22C55E]/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1F1F23]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-medium tracking-wide text-[#22C55E] uppercase">Clean version</span>
            </div>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1D] hover:bg-[#2A2A2E] border border-[#2A2A2E] rounded-md text-[#ADADB0] text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate new version"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRegenerating ? 'Generating...' : 'New version'}
            </button>
          </div>
          <p className="text-[15px] text-white leading-[1.8] font-mono whitespace-pre-wrap">
            {cleanText}
            {isRegenerating && (
              <span className="inline-block w-[3px] h-[1.2em] bg-[#22C55E] ml-0.5 align-middle animate-terminal-cursor" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
