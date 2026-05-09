'use client';

import { useState } from 'react';
import { useNotes } from '@/lib/hooks/useNotes';
import { useRouter } from 'next/navigation';
import { IconPlus, IconSearch, IconFileText } from '@/components/ui/Icons';

const NOTE_COLORS = [
  { name: 'ขาว', value: 'var(--note-white)' }, { name: 'ครีม', value: 'var(--note-cream)' },
  { name: 'พีช', value: 'var(--note-peach)' }, { name: 'ชมพู', value: 'var(--note-pink)' },
  { name: 'ม่วง', value: 'var(--note-lavender)' }, { name: 'ฟ้า', value: 'var(--note-blue)' },
  { name: 'เขียว', value: 'var(--note-green)' }, { name: 'เหลือง', value: 'var(--note-yellow)' },
];

export default function NotesPage() {
  const { notes, loading, addNote } = useNotes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const subjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)));

  const filtered = notes.filter((n) => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (subjectFilter && n.subject !== subjectFilter) return false;
    return true;
  });

  const handleNew = async () => {
    const id = await addNote({ title: 'โน้ตใหม่', body: '', subject: '', color: 'var(--note-white)' });
    if (id) router.push(`/notes/${id}`);
  };

  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > 80 ? text.substring(0, 80) + '...' : text || 'ยังไม่มีเนื้อหา';
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div className="animate-fade-in">
      {/* Top Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <IconSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
          <input className="input" placeholder="ค้นหาโน้ต..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button className={`chip ${!subjectFilter ? 'active' : ''}`} onClick={() => setSubjectFilter('')}
            style={!subjectFilter ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)' } : {}}>ทั้งหมด</button>
          {subjects.map((s) => (
            <button key={s} className={`chip ${subjectFilter === s ? 'active' : ''}`} onClick={() => setSubjectFilter(s)}
              style={subjectFilter === s ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)' } : {}}>{s}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={handleNew}>
          <IconPlus size={16} /> สร้างโน้ต
        </button>
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-hint)' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', 
            background: 'var(--accent-soft)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <IconFileText size={36} style={{ color: 'var(--accent)', opacity: 0.6 }} />
          </div>
          <p style={{ fontSize: 15, marginBottom: 4 }}>ยังไม่มีโน้ต</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>สร้างโน้ตแรกเพื่อเริ่มจดบันทึก</p>
          <button className="btn-primary" onClick={handleNew} style={{ marginTop: 16 }}>
            <IconPlus size={16} /> สร้างโน้ตแรก
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {filtered.map((note) => (
            <div 
              key={note.id} 
              className="card note-card" 
              onClick={() => handleNoteClick(note.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNoteClick(note.id); }}
              style={{ 
                cursor: 'pointer', 
                background: note.color || 'var(--surface)', 
                padding: 18,
                borderLeft: `3px solid ${
                  note.color === 'var(--note-peach)' ? 'var(--accent)' :
                  note.color === 'var(--note-pink)' ? 'var(--rose)' :
                  note.color === 'var(--note-lavender)' ? 'var(--violet)' :
                  note.color === 'var(--note-blue)' ? 'var(--sky)' :
                  note.color === 'var(--note-green)' ? 'var(--teal)' :
                  note.color === 'var(--note-yellow)' ? 'var(--amber)' :
                  'var(--border-strong)'
                }`,
              }}
            >
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.title}
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {getPreview(note.body)}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {note.subject && <span className="pill pill-neutral">{note.subject}</span>}
                <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>
                  {note.updatedAt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
