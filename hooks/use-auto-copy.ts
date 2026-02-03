'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'adf-auto-copy';

function getInitialAutoCopy(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function useAutoCopy() {
  const [autoCopy, setAutoCopy] = useState(getInitialAutoCopy);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Save to localStorage when changed
  const toggleAutoCopy = useCallback(() => {
    setAutoCopy(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  // Copy text and show toast
  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { autoCopy, toggleAutoCopy, copyText, showCopiedToast };
}
