'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
  collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, Timestamp,
} from 'firebase/firestore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
}

// Local storage helpers for local mode
const LOCAL_CHATS_KEY = 'studyos_local_chats';
function getLocalChats(): Chat[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((c: Record<string, unknown>) => ({
      ...c,
      createdAt: new Date(c.createdAt as string),
      messages: ((c.messages || []) as Record<string, unknown>[]).map(m => ({
        ...m, timestamp: new Date(m.timestamp as string),
      })),
    }));
  } catch { return []; }
}
function saveLocalChats(chats: Chat[]) {
  localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(chats));
}

export function useChat() {
  const { user, isLocalMode } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Firebase listener for logged-in users
  useEffect(() => {
    if (isLocalMode) {
      setChats(getLocalChats());
      setLoading(false);
      return;
    }
    if (!user) { setChats([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'chats'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: Chat[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id, title: data.title || 'แชทใหม่',
          messages: (data.messages || []).map((m: Record<string, unknown>) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content as string,
            timestamp: (m.timestamp as Timestamp)?.toDate() || new Date(),
            model: m.model as string | undefined,
          })),
          model: data.model || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setChats(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user, isLocalMode]);

  // Sync activeChat when chats update
  useEffect(() => {
    if (activeChat) {
      const updated = chats.find((c) => c.id === activeChat.id);
      if (updated && JSON.stringify(updated.messages) !== JSON.stringify(activeChat.messages)) {
        setActiveChat(updated);
      }
    }
  }, [chats, activeChat]);

  const createChat = useCallback(async (model: string) => {
    if (isLocalMode) {
      const id = 'local_' + Date.now();
      const newChat: Chat = { id, title: 'แชทใหม่', messages: [], model, createdAt: new Date() };
      const updated = [newChat, ...getLocalChats()];
      saveLocalChats(updated);
      setChats(updated);
      setActiveChat(newChat);
      return id;
    }
    if (!user) return '';
    const ref = await addDoc(collection(db, 'users', user.uid, 'chats'), {
      title: 'แชทใหม่', messages: [], model, createdAt: Timestamp.now(),
    });
    const newChat: Chat = { id: ref.id, title: 'แชทใหม่', messages: [], model, createdAt: new Date() };
    setActiveChat(newChat);
    return ref.id;
  }, [user, isLocalMode]);

  const sendMessage = useCallback(async (
    chatId: string, content: string, model: string,
    systemPrompt: string
  ) => {
    if (sending) return;
    if (!isLocalMode && !user) return;
    setSending(true);
    try {
      // Build messages
      const chat = chats.find((c) => c.id === chatId) || activeChat;
      const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() };
      const currentMessages = chat ? [...chat.messages, userMsg] : [userMsg];
      const title = currentMessages.length <= 1 ? content.slice(0, 40) : (chat?.title || content.slice(0, 40));

      // Save user message
      if (isLocalMode) {
        const all = getLocalChats();
        const idx = all.findIndex(c => c.id === chatId);
        if (idx >= 0) { all[idx].messages = currentMessages; all[idx].title = title; }
        saveLocalChats(all);
        setChats([...all]);
        setActiveChat(all[idx] || null);
      } else if (user) {
        await updateDoc(doc(db, 'users', user.uid, 'chats', chatId), {
          messages: currentMessages.map((m) => ({
            ...m, timestamp: Timestamp.fromDate(m.timestamp),
          })),
          title,
        });
      }

      // Call AI
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, model }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `AI Error: ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: data.content || 'ขออภัย ไม่สามารถตอบได้ในขณะนี้',
        timestamp: new Date(),
        model: typeof model === 'string' ? model : undefined,
      };

      const allMessages = [...currentMessages, aiMsg];

      // Save AI response
      if (isLocalMode) {
        const all = getLocalChats();
        const idx = all.findIndex(c => c.id === chatId);
        if (idx >= 0) { all[idx].messages = allMessages; }
        saveLocalChats(all);
        setChats([...all]);
        setActiveChat(all[idx] || null);
      } else if (user) {
        await updateDoc(doc(db, 'users', user.uid, 'chats', chatId), {
          messages: allMessages.map((m) => ({
            ...m, timestamp: Timestamp.fromDate(m.timestamp),
          })),
        });
      }

      // Background: extract memories
      try {
        const extractRes = await fetch('/api/ai/extract-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages.slice(-4).map(m => ({ role: m.role, content: m.content })),
          }),
        });
        if (extractRes.ok) {
          const extractData = await extractRes.json();
          if (extractData.memories?.length > 0) {
            window.dispatchEvent(new CustomEvent('ai-memories-extracted', {
              detail: extractData.memories,
            }));
          }
        }
      } catch {
        // Silent fail for memory extraction
      }
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [user, isLocalMode, sending, chats, activeChat]);

  const deleteChat = useCallback(async (chatId: string) => {
    if (isLocalMode) {
      const all = getLocalChats().filter(c => c.id !== chatId);
      saveLocalChats(all);
      setChats(all);
      if (activeChat?.id === chatId) setActiveChat(null);
      return;
    }
    if (!user) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', user.uid, 'chats', chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Delete chat error:', error);
    }
  }, [user, isLocalMode, activeChat]);

  return { chats, activeChat, setActiveChat, loading, sending, createChat, sendMessage, deleteChat };
}
