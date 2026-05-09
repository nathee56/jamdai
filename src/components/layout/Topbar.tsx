'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/lib/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  IconSun, IconMoon, IconPlus, IconMenu, IconX, IconSearch,
  IconCalendar, IconFileText, IconCpu, IconSettings, IconHome, IconCheckSquare, IconMessageCircle
} from '@/components/ui/Icons';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: IconHome },
    { href: '/todo', label: 'To-Do List', icon: IconCheckSquare },
    { href: '/schedule', label: 'ตารางเรียน', icon: IconCalendar },
    { href: '/notes', label: 'โน้ตทั้งหมด', icon: IconFileText },
    { href: '/ai', label: 'AI Assistant', icon: IconMessageCircle },
    { href: '/ai-tools', label: 'AI Tools', icon: IconCpu },
    { href: '/settings', label: 'ตั้งค่า', icon: IconSettings },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/ai?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <>
    <header className="topbar" style={isMobile ? { height: 56, padding: '0 16px' } : undefined}>
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button 
            className="btn-icon" 
            onClick={() => setIsMenuOpen(true)} 
            style={{ 
              width: 40, height: 40, 
              borderRadius: 12,
            }}
            aria-label="เปิดเมนู"
          >
            <IconMenu size={20} />
          </button>
        )}
        {!isMobile && (
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h1>
            {subtitle && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 400 }}>{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Center — mobile only */}
      {isMobile && (
        <h1 style={{ 
          fontSize: 16, fontWeight: 600,
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '50%'
        }}>
          {title}
        </h1>
      )}

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search — desktop/tablet only */}
        {!isMobile && (
          <div style={{ position: 'relative', width: 220 }}>
            <IconSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              style={{ paddingLeft: 36, height: 40, fontSize: 14 }}
            />
          </div>
        )}

        {/* Dark mode toggle */}
        <button 
          className="btn-icon" 
          onClick={handleToggleTheme} 
          title={theme === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'} 
          style={{ 
            width: 38, height: 38,
            borderRadius: 12,
            background: theme === 'dark' ? 'rgba(255,190,36,0.12)' : 'rgba(100,100,180,0.08)',
          }}
          aria-label="สลับธีม"
        >
          {theme === 'light' ? <IconMoon size={18} style={{ color: 'var(--violet)' }} /> : <IconSun size={18} style={{ color: 'var(--amber)' }} />}
        </button>
        
        {/* Quick add — desktop/tablet only */}
        {!isMobile && (
          <button className="btn-primary" onClick={() => router.push('/notes?new=1')} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 10, gap: 4, height: 36 }}>
            <IconPlus size={15} /> สร้างโน้ต
          </button>
        )}

        {/* Avatar */}
        {user && (
          <div style={{
            width: 34, height: 34, borderRadius: 12, overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--accent-soft), var(--violet-soft))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '1px solid var(--border-strong)',
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        )}
      </div>
    </header>

    {/* Mobile Drawer */}
    {isMenuOpen && (
      <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} onClick={() => setIsMenuOpen(false)} />
        <div style={{ 
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '280px', 
          background: 'var(--surface-card)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}>
          <div style={{ padding: '24px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              Study<span style={{ color: 'var(--accent)' }}>OS</span>
            </h2>
            <button className="btn-icon" onClick={() => setIsMenuOpen(false)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-raised)' }}>
              <IconX size={18} />
            </button>
          </div>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            {menuItems.map(item => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link 
                  key={item.href} href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {/* Theme toggle in drawer */}
          <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn-ghost" 
              onClick={handleToggleTheme}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px', borderRadius: 12, gap: 12 }}
            >
              {theme === 'light' ? <IconMoon size={18} style={{ color: 'var(--violet)' }} /> : <IconSun size={18} style={{ color: 'var(--amber)' }} />}
              <span>{theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
