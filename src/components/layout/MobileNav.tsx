'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconHome, IconCheckSquare, IconCalendar, IconMessageCircle, IconPlus, IconFileText
} from '@/components/ui/Icons';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* FAB Action Sheet Backdrop */}
      {showSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowSheet(false)}>
          <div className="fab-sheet open" onClick={(e) => e.stopPropagation()}>
            <button className="fab-sheet-item" onClick={() => { router.push('/todo?new=1'); setShowSheet(false); }}>
              <IconCheckSquare size={18} style={{ color: 'var(--accent)' }} />
              <span>เพิ่ม To-Do</span>
            </button>
            <button className="fab-sheet-item" onClick={() => { router.push('/notes?new=1'); setShowSheet(false); }}>
              <IconFileText size={18} style={{ color: 'var(--accent)' }} />
              <span>สร้างโน้ต</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation — 4 tabs + center FAB */}
      <nav className="mobile-nav">
        <Link href="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <IconHome size={24} />
          {isActive('/') && <span className="nav-active-dot" />}
        </Link>

        <Link href="/todo" className={`mobile-nav-item ${isActive('/todo') ? 'active' : ''}`}>
          <IconCheckSquare size={24} />
          {isActive('/todo') && <span className="nav-active-dot" />}
        </Link>

        <button
          className="fab"
          onClick={() => setShowSheet(!showSheet)}
        >
          <IconPlus size={26} style={{ transform: showSheet ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        <Link href="/schedule" className={`mobile-nav-item ${isActive('/schedule') ? 'active' : ''}`}>
          <IconCalendar size={24} />
          {isActive('/schedule') && <span className="nav-active-dot" />}
        </Link>

        <Link href="/ai" className={`mobile-nav-item ${isActive('/ai') ? 'active' : ''}`}>
          <IconMessageCircle size={24} />
          {isActive('/ai') && <span className="nav-active-dot" />}
        </Link>
      </nav>
    </>
  );
}
