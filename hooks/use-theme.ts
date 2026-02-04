'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'muse-filter-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const validThemes = ['dark', 'light'];
    setThemeState(saved && validThemes.includes(saved) ? saved : 'dark');
    setIsLoaded(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);

      // Update body background
      const bgColor = theme === 'dark' ? '#0A0A0B' : '#F8F8F5';
      document.body.style.backgroundColor = bgColor;
      document.documentElement.style.backgroundColor = bgColor;

      // Update theme-color meta tag for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', bgColor);
      }
    }
  }, [theme, isLoaded]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isLoaded };
}
