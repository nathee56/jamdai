'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Todo } from './useTodos';

const STORAGE_KEY = 'studyos_local_todos';

function loadTodos(): Todo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((t: any) => ({
      ...t,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
      createdAt: new Date(t.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function useLocalTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTodos(loadTodos());
    setLoading(false);
  }, []);

  const addTodo = useCallback(
    async (todo: Omit<Todo, 'id' | 'createdAt'>) => {
      const newTodo: Todo = {
        ...todo,
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date(),
      };
      setTodos((prev) => {
        const updated = [newTodo, ...prev];
        saveTodos(updated);
        return updated;
      });
    },
    []
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      setTodos((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        saveTodos(updated);
        return updated;
      });
    },
    []
  );

  const toggleTodo = useCallback(
    async (id: string, done: boolean) => {
      setTodos((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, done } : t));
        saveTodos(updated);
        return updated;
      });
    },
    []
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      setTodos((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveTodos(updated);
        return updated;
      });
    },
    []
  );

  return { todos, loading, addTodo, updateTodo, toggleTodo, deleteTodo };
}
