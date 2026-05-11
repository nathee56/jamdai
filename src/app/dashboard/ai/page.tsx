'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat, ChatMessage } from '@/lib/hooks/useChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTodos } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { useNotes } from '@/lib/hooks/useNotes';
import { useAIMemory } from '@/lib/hooks/useAIMemory';
import { MODELS, MODEL_INFO, ModelKey, buildSystemPrompt, recommendModel } from '@/lib/thaillm';
import { 
  IconPlus, IconMessageCircle, IconTrash, IconCpu, IconChevronDown, 
  IconSparkle, IconClock, IconPaperclip, IconUser, IconX,
  IconCheckSquare, IconCalendar, IconFileText
} from '@/components/ui/Icons';

export default function AIPage() {
  const { user } = useAuth();
  const { chats, activeChat, setActiveChat, loading, sending, createChat, sendMessage, deleteChat } = useChat();
  const { todos } = useTodos();
  const { getTodayClasses, schedule } = useSchedule();
  const { notes } = useNotes();
  const { memories, getMemoryPrompt, deleteMemory } = useAIMemory();

  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelKey | 'auto'>('auto');
  const [showModels, setShowModels] = useState(false);
  const [fileContext, setFileContext] = useState<{ name: string; content: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayClasses = useMemo(() => getTodayClasses(), [getTodayClasses]);
  const pendingTodos = todos.filter((t) => !t.done);
  
  const [googleData, setGoogleData] = useState<string>('');

  // Fetch Google Workspace context
  useEffect(() => {
    async function fetchGoogleData() {
      if (!user) return;
      try {
        const [gmailRes, driveRes, calendarRes] = await Promise.all([
          fetch('/api/google/gmail'),
          fetch('/api/google/drive'),
          fetch('/api/google/calendar')
        ]);
        
        let context = 'ข้อมูลจาก Google Workspace ของผู้ใช้:\n';
        
        if (gmailRes.ok) {
          const data = await gmailRes.json();
          const emails = data?.messages?.map((m: any) => `  - ${m.subject} (จาก: ${m.from})`).join('\n') || '  ไม่มีอีเมลล่าสุด';
          context += `- Gmail:\n${emails}\n`;
        }
        
        if (driveRes.ok) {
          const data = await driveRes.json();
          const files = data?.files?.map((f: any) => `  - ${f.name}`).join('\n') || '  ไม่มีไฟล์ล่าสุด';
          context += `- Drive:\n${files}\n`;
        }
        
        if (calendarRes.ok) {
          const data = await calendarRes.json();
          const events = data?.items?.map((e: any) => `  - ${e.summary}`).join('\n') || '  ไม่มีกิจกรรมวันนี้';
          context += `- Calendar:\n${events}\n`;
        }
        
        setGoogleData(context);
      } catch (e) {
        console.error('Failed to fetch Google context', e);
      }
    }
    fetchGoogleData();
  }, [user]);

  const systemPrompt = useMemo(() => {
    const basePrompt = buildSystemPrompt({
      todos: pendingTodos.map((t) => `${t.title} (${t.subject || 'ไม่ระบุวิชา'}, ส่ง: ${t.dueDate?.toLocaleDateString('th-TH') || '-'})`).join(', '),
      schedule: schedule.map((s) => `${s.name} ${s.day} ${s.startTime}-${s.endTime}`).join(', '),
      notes: notes.slice(0, 5).map((n) => `${n.title}`).join(', '),
      memories: getMemoryPrompt(),
    });
    
    return `${basePrompt}\n\n${googleData}\n\nตอนท้ายสุดของคำตอบของคุณ ให้แนะนำคำถามถัดไปที่น่าสนใจ 3 ข้อเพื่อถามต่อ โดยคั่นด้วยเครื่องหมาย | และวางไว้บรรทัดสุดท้าย (ตัวอย่าง: แนะนำ: ข้อต่อไปคืออะไร | ขอรายละเอียดเพิ่ม | ยกตัวอย่าง)`;
  }, [pendingTodos, schedule, notes, googleData, getMemoryPrompt]);

  const suggestions = useMemo(() => {
    const items = [];
    if (pendingTodos.length > 0) items.push(`งานอะไรส่งเร็วที่สุด?`);
    if (todayClasses.length > 0) items.push(`คาบเรียนวันนี้มีอะไรบ้าง?`);
    if (notes.length > 0) items.push(`สรุปโน้ต ${notes[0]?.title} ให้หน่อย`);
    items.push('วางแผนการเรียนให้หน่อย');
    return items.slice(0, 4);
  }, [pendingTodos, todayClasses, notes]);

  const [showMobileHistory, setShowMobileHistory] = useState(false);

  // Message Handler with Hoisting Fix
  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg && !fileContext) return;

    let chatId = activeChat?.id;
    if (!chatId) {
      chatId = await createChat(model === 'auto' ? MODELS['openthaigpt'] : MODELS[model]);
    }
    if (!chatId) return;

    setInput('');
    let finalContent = msg;
    if (fileContext) {
      finalContent = msg 
        ? `คำสั่ง/คำถาม: ${msg}\n\nเนื้อหาจากไฟล์ "${fileContext.name}":\n\n${fileContext.content}`
        : `กรุณาสรุปเนื้อหาจากไฟล์ "${fileContext.name}" นี้ให้หน่อย:\n\n${fileContext.content}`;
      setFileContext(null);
    }

    const selectedModel = model === 'auto' ? MODELS[recommendModel(msg || 'summarize')] : MODELS[model];
    try {
      await sendMessage(chatId, finalContent, selectedModel, systemPrompt);
    } catch (err) {
      console.error(err);
      alert('AI ไม่ตอบสนอง โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ API Key ในระบบ');
    }
  }, [input, fileContext, activeChat, model, createChat, sendMessage, systemPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sending]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fromFile') === 'true') {
      const contextStr = sessionStorage.getItem('ai_file_context');
      if (contextStr) {
        const { name, content } = JSON.parse(contextStr);
        setFileContext({ name, content });
      }
    }
    
    const initialQuery = sessionStorage.getItem('ai_initial_query');
    if (initialQuery) {
      sessionStorage.removeItem('ai_initial_query');
      handleSend(initialQuery);
    }
  }, [handleSend]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContext({ name: file.name, content: event.target?.result as string });
    };
    reader.readAsText(file);
  };

  const handleNewChat = async () => {
    const selectedModel = model === 'auto' ? MODELS['openthaigpt'] : MODELS[model];
    const id = await createChat(selectedModel);
    if (id) {
      setActiveChat({ id, title: 'แชทใหม่', messages: [], model: selectedModel, createdAt: new Date() });
      setShowMobileHistory(false);
    }
  };

  return (
    <div className="ai-chat-viewport animate-fade-in" style={{ display: 'flex', gap: 16 }}>
      {/* Chat History - Desktop */}
      <div className="card" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        id="chat-history-panel">
        <button className="btn-primary" onClick={handleNewChat} style={{ marginBottom: 12, width: '100%', fontSize: 13 }}>
          <IconPlus size={14} /> แชทใหม่
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map((chat) => (
            <div key={chat.id} style={{ display: 'flex', width: '100%', margin: '2px 0', position: 'relative' }} className="nav-item-wrapper">
              <button
                className={`nav-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
                style={{ flex: 1, padding: '8px 10px', textAlign: 'left', minWidth: 0 }}>
                <IconMessageCircle size={14} />
                <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-hint)' }}>
                    {chat.createdAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </button>
              <button 
                className="btn-icon" 
                style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', opacity: activeChat?.id === chat.id ? 1 : 0.4, padding: 4 }}
                onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                title="ลบแชท"
              >
                <IconTrash size={14} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="ai-chat-viewport-inner">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon mobile-only" onClick={() => setShowMobileHistory(true)} 
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <IconMessageCircle size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <button className="btn-ghost" onClick={() => setShowModels(!showModels)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 12 }}>
                <IconCpu size={14} /> {model === 'auto' ? 'Auto (AI แนะนำ)' : MODEL_INFO[model].name}
                <IconChevronDown size={14} style={{ transform: showModels ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showModels && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setShowModels(false)} />
                  <div className="card" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, padding: 4, zIndex: 20, minWidth: 280 }}>
                    <button className={`nav-item ${model === 'auto' ? 'active' : ''}`}
                      onClick={() => { setModel('auto'); setShowModels(false); }}
                      style={{ width: '100%', margin: '2px 0', padding: '8px 12px' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--orange)' }}>Auto (AI แนะนำ)</div>
                        <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>ให้ระบบเลือกโมเดลที่เหมาะกับคำถามให้อัตโนมัติ</div>
                      </div>
                    </button>
                    {(Object.keys(MODELS) as ModelKey[]).map((key) => (
                      <button key={key} className={`nav-item ${model === key ? 'active' : ''}`}
                        onClick={() => { setModel(key); setShowModels(false); }}
                        style={{ width: '100%', margin: '2px 0', padding: '8px 12px' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{MODEL_INFO[key].name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{MODEL_INFO[key].description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <div style={{ 
                width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', 
                border: '2px solid var(--border-strong)', background: 'var(--surface-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconUser size={18} style={{ color: 'var(--accent)' }} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="ai-empty-state">
              <IconSparkle size={48} style={{ color: 'var(--accent)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>JamDai AI พร้อมช่วยแล้ว</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>ถามอะไรก็ได้เกี่ยวกับงานและการเรียนของคุณ</p>
              <div className="ai-suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="chip" onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg, i) => {
              let content = msg.content;
              let choices: string[] = [];
              if (msg.role === 'assistant' && content.includes('|')) {
                const lines = content.split('\n');
                const lastLine = lines[lines.length - 1];
                if (lastLine.includes('|')) {
                  choices = lastLine.replace(/^แนะนำ:\s*/, '').split('|').map(s => s.trim()).filter(s => s);
                  content = lines.slice(0, -1).join('\n');
                }
              }

              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', padding: '0 4px', marginBottom: 12 }}>
                  <div className={msg.role === 'user' ? 'chat-bubble chat-bubble-user' : 'chat-bubble chat-bubble-ai'} 
                    style={{ maxWidth: msg.role === 'user' ? '85%' : '95%', fontSize: 14, wordBreak: 'break-word', lineHeight: 1.5, fontFamily: 'inherit' }}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                      </div>
                    ) : content}
                  </div>
                  {choices.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {choices.map((c, idx) => (
                        <button key={idx} className="chip" onClick={() => handleSend(c)} style={{ fontSize: 11, background: 'var(--surface-card)', border: '1px solid var(--border)' }}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
          {sending && (
            <div className="chat-bubble chat-bubble-ai" style={{ width: 'fit-content', marginLeft: 4 }}>
              <div className="typing-indicator">
                <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="ai-chat-input-area">
          {fileContext && (
            <div className="ai-file-badge" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: 'var(--accent-soft)', borderRadius: 12, marginBottom: 8, fontSize: 12 }}>
               <IconPaperclip size={14} /> <span>ไฟล์: <strong>{fileContext.name}</strong></span>
               <button className="btn-icon" onClick={() => setFileContext(null)}><IconX size={14} /></button>
            </div>
          )}
          <div className="ai-chat-input-row" style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon" onClick={() => fileInputRef.current?.click()} style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--surface-raised)' }}>
              <IconPaperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                className="input" 
                style={{ width: '100%', height: 48, paddingRight: 50, borderRadius: 16, fontSize: 14 }}
                placeholder="ถาม JamDai AI ได้ทุกเรื่อง..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                className="btn-primary" 
                style={{ position: 'absolute', right: 4, top: 4, bottom: 4, width: 40, borderRadius: 12, padding: 0 }}
                onClick={() => handleSend()}
                disabled={sending}
              >
                {sending ? '...' : '→'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel - Desktop */}
      <div className="card desktop-only" style={{ width: 220, flexShrink: 0, padding: 20, borderRadius: 24, fontSize: 12 }}>
         <h4 style={{ fontWeight: 800, marginBottom: 12, color: 'var(--text-hint)' }}>บริบทการเรียน</h4>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconCheckSquare size={14} /> งานค้าง ({pendingTodos.length})
              </div>
              {pendingTodos.slice(0, 3).map(t => <div key={t.id} style={{ opacity: 0.7, marginBottom: 2 }}>• {t.title}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconCalendar size={14} /> ตารางเรียน ({todayClasses.length})
              </div>
              {todayClasses.slice(0, 3).map(c => <div key={c.id} style={{ opacity: 0.7, marginBottom: 2 }}>• {c.name}</div>)}
            </div>
         </div>
      </div>

      <style jsx>{`
        .ai-chat-viewport { 
          max-width: 1200px; margin: 0 auto; padding: 16px; 
          font-family: 'Inter', 'Prompt', sans-serif;
        }
        .ai-chat-viewport-inner { flex: 1; min-width: 0; display: flex; flexDirection: column; height: calc(100vh - 120px); }
        .ai-chat-messages { flex: 1; overflow-y: auto; padding: 16px 0; display: flex; flexDirection: column; gap: 4px; }
        .ai-chat-input-area { padding-top: 12px; }
        .chat-bubble { padding: 12px 16px; border-radius: 18px; line-height: 1.5; }
        .chat-bubble-user { background: var(--accent); color: white; border-bottom-right-radius: 4px; }
        .chat-bubble-ai { background: var(--surface-card); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
        .typing-dot { width: 6px; height: 6px; background: var(--text-hint); border-radius: 50%; display: inline-block; margin: 0 2px; animation: bounce 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}
