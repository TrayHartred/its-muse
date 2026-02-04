'use client';

import { Tactic } from '@/lib/schemas';
import { HighlightedText } from './highlighted-text';
import { Theme } from '@/hooks/use-theme';

interface ComparisonViewProps {
  originalText: string;
  cleanText: string;
  tactics: Tactic[];
  onTacticHover: (index: number | null) => void;
  onCopy: () => void;
  copied: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
  theme?: Theme;
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
  theme = 'dark',
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

  // Theme colors
  const colors = {
    card: theme === 'dark' ? 'rgba(17,17,19,0.9)' : 'rgba(255,255,255,0.9)',
    cardBorder: theme === 'dark' ? '#1F1F23' : '#E5E5E0',
    text: theme === 'dark' ? '#E4E4E7' : '#1A1A1D',
    textSecondary: theme === 'dark' ? '#A1A1AA' : '#52525B',
    textMuted: theme === 'dark' ? '#71717A' : '#A1A1AA',
    button: theme === 'dark' ? '#1A1A1D' : '#F0F0EB',
    buttonBorder: theme === 'dark' ? '#27272A' : '#E0E0DB',
    cleanText: theme === 'dark' ? '#E4E4E7' : '#1A1A1D',
  };

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm rounded-xl px-4 py-3 transition-colors duration-300"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        }}
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2">
            <span className="text-[13px]" style={{ color: colors.textMuted }}>Found:</span>
            <span className="text-sm font-semibold" style={{ color: colors.text }}>
              {total} {total === 1 ? 'tactic' : 'tactics'}
            </span>
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
        <div
          className="backdrop-blur-sm rounded-xl p-4 sm:p-5 transition-colors duration-300"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}
        >
          <div
            className="flex items-center gap-2 mb-3 pb-2.5"
            style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
          >
            <svg className="w-4 h-4" style={{ color: colors.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[13px] font-medium tracking-wide uppercase" style={{ color: colors.textMuted }}>
              Original
            </span>
          </div>
          <div className="text-[15px] leading-[1.7]" style={{ color: colors.textSecondary }}>
            <HighlightedText
              text={originalText}
              tactics={tactics}
              onTacticHover={onTacticHover}
              theme={theme}
            />
          </div>
        </div>

        {/* Clean */}
        <div
          className="backdrop-blur-sm rounded-xl p-4 sm:p-5 transition-colors duration-300"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.3)',
          }}
        >
          <div
            className="flex items-center justify-between mb-3 pb-2.5"
            style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[13px] font-medium tracking-wide text-[#22C55E] uppercase">Clean version</span>
            </div>
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: colors.button,
                borderWidth: 1,
                borderColor: colors.buttonBorder,
                color: colors.textSecondary,
              }}
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
          <p
            className="text-[15px] leading-[1.7] font-mono whitespace-pre-wrap"
            style={{ color: colors.cleanText }}
          >
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
