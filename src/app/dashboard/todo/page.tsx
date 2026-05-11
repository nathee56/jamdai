'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTodos, Todo } from '@/lib/hooks/useTodos';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { IconSearch, IconPlus, IconCheck, IconTrash, IconFilter, IconSort, IconSparkle, IconCheckSquare } from '@/components/ui/Icons';
import { AnimatedCheckbox } from '@/components/ui/AnimatedComponents';

interface AIPriority {
  todoId: string;
  score: number;
  reason: string;
}

const STORAGE_KEY = 'jamdai_ai_priorities_nu';

export default function TodoPage() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { schedule } = useSchedule();
  
  // UI States
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'urgent' | 'done'>('pending');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'subject' | 'ai-priority'>('dueDate');
  const [isMobile, setIsMobile] = useState(false);
  
  // New Item States
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent'>('normal');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<number>(3);

  // AI Logic States
  const [aiPriorities, setAiPriorities] = useState<AIPriority[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load cache on mount & check mobile
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setAiPriorities(parsed);
        setSortBy('ai-priority');
      } catch (e) { console.error('Cache error', e); }
    }

    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // AI Action
  const handleAIPrioritize = async () => {
    const pendingItems = todos.filter(t => !t.done);
    if (pendingItems.length === 0) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todos: pendingItems.map(t => ({
            id: t.id, title: t.title, subject: t.subject,
            dueDate: t.dueDate?.toLocaleDateString('th-TH') || 'ไม่มี',
            priority: t.priority, difficulty: t.difficulty || 3
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const priorities = data.priorities || [];
        setAiPriorities(priorities);
        setSortBy('ai-priority');
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(priorities));
      }
    } catch (err) {
      console.error('AI Ranking Failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const subjects = useMemo(() => {
    const s = new Set(schedule.map((c) => c.name));
    todos.forEach((t) => { if (t.subject) s.add(t.subject); });
    return Array.from(s);
  }, [schedule, todos]);

  const filtered = useMemo(() => {
    let items = [...todos];
    if (search) items = items.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    if (subjectFilter) items = items.filter((t) => t.subject === subjectFilter);
    
    switch (filter) {
      case 'pending': items = items.filter((t) => !t.done); break;
      case 'urgent': items = items.filter((t) => t.priority === 'urgent' && !t.done); break;
      case 'done': items = items.filter((t) => t.done); break;
    }

    items.sort((a, b) => {
      if (sortBy === 'ai-priority' && aiPriorities.length > 0) {
        const scoreA = aiPriorities.find(p => p.todoId === a.id)?.score || 0;
        const scoreB = aiPriorities.find(p => p.todoId === b.id)?.score || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'dueDate') return (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity);
      if (sortBy === 'priority') return a.priority === 'urgent' ? -1 : 1;
      return (a.subject || '').localeCompare(b.subject || '');
    });

    return items;
  }, [todos, search, filter, subjectFilter, sortBy, aiPriorities]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addTodo({
      title: newTitle.trim(), subject: newSubject, priority: newPriority,
      difficulty: newDifficulty,
      dueDate: newDueDate ? new Date(newDueDate) : null, done: false,
    });
    setNewTitle(''); setNewSubject(''); setNewPriority('normal'); setNewDueDate(''); setNewDifficulty(3);
  };

  const renderTodoItem = (todo: Todo) => {
    const aiRank = aiPriorities.find(p => p.todoId === todo.id);
    const isFirst = sortBy === 'ai-priority' && aiRank && aiPriorities[0]?.todoId === todo.id;

    return (
      <div key={todo.id} 
        className={`todo-item animate-in ${todo.done ? 'done' : ''} ${isFirst ? 'ai-highlight' : ''}`}
        style={{ 
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', 
          borderBottom: '1px solid var(--border)',
          transition: 'all 0.3s ease'
        }}>
        <AnimatedCheckbox checked={todo.done} onChange={() => toggleTodo(todo.id, !todo.done)} />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
             <div style={{ fontSize: 15, fontWeight: isFirst ? 700 : 600, color: 'var(--text-primary)', wordBreak: 'break-word', lineHeight: 1.4 }} className={todo.done ? 'line-through opacity-50' : ''}>
               {todo.title}
             </div>
             {aiRank && sortBy === 'ai-priority' && !todo.done && (
               <span className={`score-badge ${aiRank.score >= 90 ? 'critical' : ''}`}>
                 {aiRank.score}%
               </span>
             )}
          </div>
          
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {todo.subject && <span className="pill pill-neutral">{todo.subject}</span>}
            {todo.priority === 'urgent' && <span className="pill pill-danger">ด่วน</span>}
            {todo.dueDate && (
              <span className="pill pill-warning">
                🗓️ {todo.dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
              </span>
            )}
            <span className="pill pill-neutral" style={{ background: 'var(--cream3)' }}>ยาก: {todo.difficulty || 3}/5</span>
            
            {aiRank && sortBy === 'ai-priority' && !todo.done && (
              <div className="ai-reason" style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,107,26,0.08)', padding: '4px 10px', borderRadius: 12 }}>
                <IconSparkle size={12} /> {aiRank.reason}
              </div>
            )}
          </div>
        </div>

        <button className="btn-icon delete-btn" onClick={() => deleteTodo(todo.id)} style={{ flexShrink: 0 }}>
          <IconTrash size={16} />
        </button>
      </div>
    );
  };

  if (loading) return <div className="skeleton-screen" style={{ height: 400, borderRadius: 24, background: 'var(--surface-raised)' }} />;

  return (
    <div className="todo-container animate-in">
      {/* Header Section */}
      <div className="todo-header" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <IconSearch size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input 
            className="input" 
            placeholder="ค้นหางาน หรือ วิชา..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: '100%', height: 52, padding: '0 16px 0 48px', borderRadius: 16, fontSize: 15 }}
          />
        </div>
        
        <button 
          className={`ai-btn ${isAnalyzing ? 'loading' : ''}`}
          onClick={handleAIPrioritize}
          disabled={isAnalyzing || todos.filter(t => !t.done).length === 0}
          style={{ 
            background: 'linear-gradient(135deg, #FF6B1A 0%, #FF9A5C 100%)', 
            color: 'white', border: 'none', borderRadius: 16, height: 52, padding: '0 24px',
            display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(255,107,26,0.2)'
          }}
        >
          <IconSparkle size={20} className={isAnalyzing ? 'spin' : ''} />
          <span>{isAnalyzing ? 'กำลังวิเคราะห์...' : 'AI จัดลำดับ'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Sidebar Filters */}
        <aside style={{ width: isMobile ? '100%' : 240, flexShrink: 0 }}>
          <div className="card" style={{ padding: 20, position: isMobile ? 'static' : 'sticky', top: 100, borderRadius: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: 16 }}>ตัวกรอง</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['all', 'pending', 'urgent', 'done'].map((f) => (
                <button key={f} 
                  className={`filter-link ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f as any)}
                  style={{ 
                    padding: '10px 14px', border: 'none', background: filter === f ? 'var(--accent-soft)' : 'transparent',
                    color: filter === f ? 'var(--accent)' : 'var(--text-secondary)', borderRadius: 12,
                    textAlign: 'left', fontWeight: filter === f ? 700 : 500, cursor: 'pointer'
                  }}
                >
                  {{ all: 'ทั้งหมด', pending: 'ค้างอยู่', urgent: 'งานด่วน', done: 'เสร็ตแล้ว' }[f]}
                </button>
              ))}
            </div>
            
            <div style={{ margin: '20px 0', borderTop: '1px solid var(--border)' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hint)', textTransform: 'uppercase', marginBottom: 12 }}>วิชา</h3>
            <select className="input" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ width: '100%' }}>
              <option value="">ทุกวิชา</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </aside>

        {/* Main List Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* AI Top Highlight */}
          {aiPriorities.length > 0 && sortBy === 'ai-priority' && todos.some(t => !t.done) && (
            <div style={{ 
              background: 'linear-gradient(135deg, #FFF5F0 0%, #FFFDFB 100%)', 
              border: '1px solid #FFD8C4', borderRadius: 24, padding: 20, marginBottom: 24,
              boxShadow: '0 8px 30px rgba(255,107,26,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D35400', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                <IconSparkle size={18} /> AI แนะนำเป็นอันดับ 1
              </div>
              {(() => {
                const top = todos.find(t => t.id === aiPriorities[0].todoId && !t.done);
                if (!top) return null;
                return (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{top.title}</div>
                    <div style={{ fontSize: 13, color: '#E67E22', fontWeight: 600 }}>{aiPriorities[0].reason}</div>
                  </div>
                );
              })()}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-hint)', fontWeight: 600 }}>พบ {filtered.length} รายการ</span>
            <select className="input" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="dueDate">เรียงตาม: วันส่ง</option>
              <option value="priority">เรียงตาม: ความสำคัญ</option>
              <option value="ai-priority">เรียงตาม: AI Priority</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 24, border: '1px solid var(--border)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-hint)' }}>
                <IconCheckSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>ไม่มีงานค้างในส่วนนี้</p>
              </div>
            ) : (
              filtered.map(renderTodoItem)
            )}
          </div>

          {/* Add Form */}
          <div className="card" style={{ marginTop: 32, padding: 24, borderRadius: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>เพิ่มงานใหม่</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input" placeholder="ทำอะไรดี..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
                 <select className="input" value={newSubject} onChange={e => setNewSubject(e.target.value)}>
                    <option value="">วิชา</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <select className="input" value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
                    <option value="normal">ปกติ</option>
                    <option value="urgent">ด่วน</option>
                 </select>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-raised)', padding: '0 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>ยาก: {newDifficulty}</span>
                    <input type="range" min="1" max="5" value={newDifficulty} onChange={e => setNewDifficulty(parseInt(e.target.value))} style={{ flex: 1 }} />
                 </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="date" className="input" style={{ flex: 1 }} value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
                <button className="btn-primary" onClick={handleAdd} style={{ padding: '0 32px' }}>เพิ่มงาน</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .todo-container { 
          max-width: 1100px; 
          margin: 0 auto; 
          padding: 24px;
          font-family: 'Inter', 'Prompt', 'Sarabun', sans-serif;
        }
        .todo-item:hover .delete-btn { opacity: 1; }
        .delete-btn { opacity: 0; transition: opacity 0.2s; }
        .todo-item.ai-highlight { border-left: 4px solid var(--orange) !important; background: #FFFAF8; }
        .score-badge { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: var(--orange-soft); color: var(--orange); border: 1px solid var(--orange-light); }
        .score-badge.critical { background: #FFE5E5; color: #FF4444; border-color: #FFB3B3; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .line-through { text-decoration: line-through; }
        
        /* Font fix for Thai characters */
        :global(.input), :global(.pill), :global(button), :global(div) {
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
