'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  IconHome, IconCheckSquare, IconCalendar, IconFileText,
  IconCpu, IconMessageCircle, IconSettings, IconLogOut, IconCloud
} from '@/components/ui/Icons';

const navItems = [
  { href: '/', label: 'Dashboard', icon: IconHome },
  { href: '/todo', label: 'To-Do List', icon: IconCheckSquare },
  { href: '/schedule', label: 'ตารางเรียน', icon: IconCalendar },
  { href: '/notes', label: 'Notes', icon: IconFileText },
  { href: '/drive', label: 'Google Drive', icon: IconCloud },
  { href: '/ai-tools', label: 'AI Tools', icon: IconCpu },
  { href: '/ai', label: 'AI Assistant', icon: IconMessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLocalMode, signOut } = useAuth();
  
  const filteredNavItems = navItems.filter(item => {
    if (isLocalMode && item.href === '/drive') return false;
    return true;
  });

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '24px 16px 16px' }}>
        <h2 className="sidebar-logo-text" style={{ fontSize: 20, color: 'var(--text-primary)', padding: '0 8px', fontWeight: 600 }}>
          Study<span style={{ color: 'var(--accent)' }}>OS</span>
        </h2>
        {/* Tablet icon-only logo */}
        <div className="sidebar-logo-icon" style={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent)' }}>S</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 4, overflowY: 'auto' }}>
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}

        <div style={{ margin: '8px 8px', borderTop: '0.5px solid var(--border)' }} />

        <Link
          href="/settings"
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          title="ตั้งค่า"
        >
          <IconSettings size={18} />
          <span>ตั้งค่า</span>
        </Link>
      </nav>

      {/* User Profile */}
      {user && (
        <div style={{
          padding: '16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--surface-raised)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {user.displayName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName || 'ผู้ใช้'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
          <button className="btn-icon sidebar-user-info" onClick={signOut} title="ออกจากระบบ" style={{ width: 32, height: 32 }}>
            <IconLogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
