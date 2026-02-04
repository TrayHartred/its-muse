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
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23] rounded-xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#71717A]">Found:</span>
            <span className="text-sm font-semibold text-[#E4E4E7]">{total} {total === 1 ? 'tactic' : 'tactics'}</span>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            {counts.high > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span className="text-[#EF4444]">{counts.high} high</span>
              </span>
            )}
            {counts.medium > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[#F59E0B]">{counts.medium} medium</span>
              </span>
            )}
            {counts.low > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" />
                <span className="text-[#EAB308]">{counts.low} low</span>
              </span>
            )}
          </div>
        </div>
        {/* Desktop copy button */}
        <button
          onClick={onCopy}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E] font-medium rounded-lg text-[13px] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy clean'}
        </button>
      </div>

      {/* Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Original */}
        <div className="bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23] rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#1F1F23]">
            <svg className="w-4 h-4 text-[#71717A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[13px] font-medium tracking-wide text-[#71717A] uppercase">Original</span>
          </div>
          <div className="text-[15px] text-[#A1A1AA] leading-[1.7]">
            <HighlightedText
              text={originalText}
              tactics={tactics}
              onTacticHover={onTacticHover}
            />
          </div>
        </div>

        {/* Clean */}
        <div className="bg-[#111113]/90 backdrop-blur-sm border border-[#22C55E]/20 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#1F1F23]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[13px] font-medium tracking-wide text-[#22C55E] uppercase">Clean version</span>
            </div>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1D] hover:bg-[#2A2A2E] border border-[#27272A] rounded-md text-[#A1A1AA] text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
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
          <p className="text-[15px] text-[#E4E4E7] leading-[1.7] font-mono whitespace-pre-wrap">
            {cleanText}
            {isRegenerating && (
              <span className="inline-block w-[2px] h-[1.1em] bg-[#22C55E] ml-0.5 align-middle animate-terminal-cursor" />
            )}
          </p>
          {/* Mobile copy button - inside clean block */}
          <button
            onClick={onCopy}
            className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#22C55E]/10 hover:bg-[#22C55E]/15 border border-[#22C55E]/25 text-[#22C55E] font-medium rounded-lg text-[15px] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy clean text'}
          </button>
        </div>
      </div>
    </div>
  );
}
