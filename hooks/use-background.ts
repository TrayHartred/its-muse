'use client';

import { useState, useEffect, useCallback } from 'react';
import { BackgroundType } from '@/components/ambient-background';

const STORAGE_KEY = 'muse-filter-background';
const DEFAULT_BG: BackgroundType = 'swirl';

export function useBackground() {
  const [background, setBackgroundState] = useState<BackgroundType>('none');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as BackgroundType | null;
    const validTypes = ['none', 'swirl', 'aurora', 'pipeline'];
    setBackgroundState(saved && validTypes.includes(saved) ? saved : DEFAULT_BG);
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const setBackground = useCallback((type: BackgroundType) => {
    setBackgroundState(type);
    localStorage.setItem(STORAGE_KEY, type);
  }, []);

  return { background, setBackground, isLoaded };
}
