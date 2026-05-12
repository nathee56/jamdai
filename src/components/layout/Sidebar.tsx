'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  IconHome, IconCheckSquare, IconCalendar, IconFileText,
  IconCpu, IconMessageCircle, IconSettings, IconLogOut, IconCloud, IconMail, IconClock, IconChevronLeft, IconChevronRight
} from '@/components/ui/Icons';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/app', label: 'หน้าแรก', icon: IconHome },
  { href: '/app/todo', label: 'งาน (To-Do)', icon: IconCheckSquare },
  { href: '/app/schedule', label: 'ตารางเรียน', icon: IconCalendar },
  { href: '/app/notes', label: 'โน้ต (Notes)', icon: IconFileText },
  { href: '/app/ai', label: 'AI Assistant', icon: IconMessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLocalMode, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Update CSS variable when collapsed state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-width', 
        isCollapsed ? '80px' : '220px'
      );
    }
  }, [isCollapsed]);
  
  const filteredNavItems = navItems;

  const isActive = (href: string) => {
    if (href === '/app') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Top Section: Workspace / User Profile (Notion style) */}
      <div style={{ padding: isCollapsed ? '16px 8px' : '16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-surface-raised">
        {user ? (
          <>
            <div style={{
              width: 28, height: 28, borderRadius: '4px', overflow: 'hidden',
              background: 'var(--surface-base)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)'
            }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {user.displayName?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName ? `${user.displayName}'s OS` : 'Study OS'}
                </div>
                <IconChevronRight size={14} style={{ color: 'var(--text-hint)' }} />
              </div>
            )}
          </>
        ) : isLocalMode ? (
          <>
            <div style={{
              width: 28, height: 28, borderRadius: '4px',
              background: 'var(--surface-base)', flexShrink: 0, border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconCloud size={16} style={{ color: 'var(--text-secondary)' }} />
            </div>
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  โหมดส่วนตัว
                </div>
                <IconChevronRight size={14} style={{ color: 'var(--text-hint)' }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: '4px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
            OS
          </div>
        )}
      </div>

      {/* Search / AI Quick Action (Optional Notion style addition) */}
      {!isCollapsed && (
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'transparent', border: '1px solid transparent', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }} className="hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <IconMessageCircle size={14} />
            <span>ค้นหา หรือถาม AI...</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingLeft: isCollapsed ? 8 : 12, paddingRight: isCollapsed ? 8 : 12 }}>
        {!isCollapsed && (
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', padding: '12px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Workspace
          </div>
        )}
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            title={item.label}
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '0' : '0 10px',
              width: isCollapsed ? '36px' : 'auto',
              margin: isCollapsed ? '4px auto' : '2px 0',
              height: 30,
              gap: 10
            }}
          >
            <item.icon size={16} />
            {!isCollapsed && <span style={{ fontSize: 13.5 }}>{item.label}</span>}
          </Link>
        ))}

        <div style={{ margin: '16px 12px 8px', borderTop: '1px solid var(--border)' }} />

        {!isCollapsed && (
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-hint)', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            System
          </div>
        )}

        <Link
          href="/app/settings"
          className={`nav-item ${isActive('/app/settings') ? 'active' : ''}`}
          title="ตั้งค่า"
          style={{ 
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0' : '0 10px',
            width: isCollapsed ? '36px' : 'auto',
            margin: isCollapsed ? '4px auto' : '2px 0',
            height: 30,
            gap: 10
          }}
        >
          <IconSettings size={16} />
          {!isCollapsed && <span style={{ fontSize: 13.5 }}>ตั้งค่า</span>}
        </Link>
        
        {user || isLocalMode ? (
          <button
            onClick={signOut}
            className="nav-item"
            title="ออกจากระบบ"
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: isCollapsed ? '0' : '0 10px',
              width: isCollapsed ? '36px' : '100%',
              margin: isCollapsed ? '4px auto' : '2px 0',
              height: 30,
              gap: 10,
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer'
            }}
          >
            <IconLogOut size={16} />
            {!isCollapsed && <span style={{ fontSize: 13.5 }}>ออกจากระบบ</span>}
          </button>
        ) : null}
      </nav>

      {/* Collapse Toggle & Footer */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', borderTop: '1px solid var(--border)' }}>
        {!isCollapsed && (
          <div style={{ fontSize: 11, color: 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }}></span>
            ระบบทำงานปกติ
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn-icon" 
          style={{ width: 24, height: 24, color: 'var(--text-secondary)' }}
          title={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {isCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
