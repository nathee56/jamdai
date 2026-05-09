'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

// Singleton theme manager to ensure all components share the same theme state
let currentTheme: 'light' | 'dark' = 'light';
const listeners = new Set<() => void>();

function getSnapshot() {
  return currentTheme;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setThemeValue(next: 'light' | 'dark') {
  currentTheme = next;
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('study-os-theme', next);
  // Update meta theme-color for PWA
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'dark' ? '#0F172A' : '#F5F5F7');
  listeners.forEach((fn) => fn());
}

// Initialize from localStorage once
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('study-os-theme') as 'light' | 'dark' | null;
  if (saved) {
    currentTheme = saved;
    // Set immediately to prevent flash
    document.documentElement.setAttribute('data-theme', saved);
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as const);

  // Hydration: ensure DOM matches on first render
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = currentTheme === 'light' ? 'dark' : 'light';
    setThemeValue(next);
  }, []);

  return { theme, toggleTheme };
}
