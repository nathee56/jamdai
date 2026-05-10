'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note } from './useNotes';

const STORAGE_KEY = 'studyos_local_notes';

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useLocalNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setNotes(loadNotes());
    setLoading(false);
  }, []);

  const addNote = useCallback(async (note: Partial<Note>) => {
    const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newNote: Note = {
      id,
      title: note.title || 'โน้ตใหม่',
      body: note.body || '',
      subject: note.subject || '',
      color: note.color || 'var(--note-white)',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => {
      const updated = [newNote, ...prev];
      saveNotes(updated);
      return updated;
    });
    return id;
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
      );
      saveNotes(updated);
      return updated;
    });
  }, []);

  const autoSave = useCallback((id: string, updates: Partial<Note>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
        );
        saveNotes(updated);
        return updated;
      });
    }, 1000);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotes(updated);
      return updated;
    });
  }, []);

  return { notes, loading, addNote, updateNote, autoSave, deleteNote };
}
