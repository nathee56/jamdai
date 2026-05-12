'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconHome, IconCheckSquare, IconCalendar, IconMessageCircle, IconPlus, IconFileText, IconClock, IconCamera
} from '@/components/ui/Icons';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const isLocalMode = typeof window !== 'undefined' && localStorage.getItem('studyos_local_mode') === 'true';
  const basePath = '/app';

  const isActive = (href: string) => {
    if (href === '/app') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* FAB Action Sheet Backdrop */}
      <AnimatePresence>
        {showSheet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} 
            onClick={() => setShowSheet(false)}
          >
            <motion.div 
              initial={{ x: "-50%", y: 50, opacity: 0, scale: 0.9 }}
              animate={{ x: "-50%", y: 0, opacity: 1, scale: 1 }}
              exit={{ x: "-50%", y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fab-sheet open" 
              onClick={(e) => e.stopPropagation()}
            >
              <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/todo?new=1`); setShowSheet(false); }}>
                <IconCheckSquare size={18} style={{ color: 'var(--accent)' }} />
                <span>เพิ่ม To-Do</span>
              </button>
              <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/notes?new=1`); setShowSheet(false); }}>
                <IconFileText size={18} style={{ color: 'var(--teal)' }} />
                <span>สร้างโน้ต</span>
              </button>
              <button className="fab-sheet-item" onClick={() => { router.push(`${basePath}/scan`); setShowSheet(false); }}>
                <IconCamera size={18} style={{ color: 'var(--rose)' }} />
                <span>สแกนโน้ต (AI)</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation — 4 tabs + center FAB */}
      <nav 
        className="md:hidden fixed bottom-6 left-5 right-5 h-[70px] rounded-[35px] z-50 flex items-center justify-around px-2"
        style={{ 
          background: 'color-mix(in srgb, var(--surface-card) 20%, transparent)',
          backdropFilter: 'blur(60px) saturate(300%)', 
          WebkitBackdropFilter: 'blur(60px) saturate(300%)', 
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.1), inset 0 2px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)',
          transform: 'translateZ(0)' 
        }}
      >
        <Link href={basePath} className={`mobile-nav-item ${isActive(basePath) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <IconHome size={24} />
            {isActive(basePath) && <motion.span layoutId="nav-dot" className="nav-active-dot" />}
          </motion.div>
        </Link>

        <Link href={`${basePath}/todo`} className={`mobile-nav-item ${isActive(`${basePath}/todo`) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <IconCheckSquare size={24} />
            {isActive(`${basePath}/todo`) && <motion.span layoutId="nav-dot" className="nav-active-dot" />}
          </motion.div>
        </Link>

        <motion.button
          whileTap={{ scale: 0.85 }}
          className="fab"
          onClick={() => setShowSheet(!showSheet)}
        >
          <motion.div animate={{ rotate: showSheet ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <IconPlus size={26} />
          </motion.div>
        </motion.button>

        <Link href={`${basePath}/notes`} className={`mobile-nav-item ${isActive(`${basePath}/notes`) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <IconFileText size={24} />
            {isActive(`${basePath}/notes`) && <motion.span layoutId="nav-dot" className="nav-active-dot" />}
          </motion.div>
        </Link>

        <Link href={`${basePath}/ai`} className={`mobile-nav-item ${isActive(`${basePath}/ai`) ? 'active' : ''}`}>
          <motion.div whileTap={{ scale: 0.8 }} className="flex flex-col items-center">
            <IconMessageCircle size={24} />
            {isActive(`${basePath}/ai`) && <motion.span layoutId="nav-dot" className="nav-active-dot" />}
          </motion.div>
        </Link>
      </nav>
    </>
  );
}
