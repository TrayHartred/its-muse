'use client';

import { Theme } from '@/hooks/use-theme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0A0A0B] light:focus:ring-offset-[#F5F5F0]"
      style={{
        backgroundColor: theme === 'dark' ? '#27272A' : '#E4E4E0',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5">
        {/* Sun icon (left) */}
        <svg
          className={`w-4 h-4 transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-40'}`}
          fill="none"
          stroke="#FCD34D"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {/* Moon icon (right) */}
        <svg
          className={`w-4 h-4 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-40'}`}
          fill="none"
          stroke="#818CF8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </span>

      {/* Sliding knob */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center"
        style={{
          left: theme === 'dark' ? '2px' : 'calc(100% - 26px)',
          backgroundColor: theme === 'dark' ? '#18181B' : '#FFFFFF',
        }}
      >
        {/* Active icon in knob */}
        {theme === 'dark' ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="#818CF8" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
