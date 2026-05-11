'use client';

import { usePWA } from '@/lib/hooks/usePWA';
import { IconDownload } from './Icons';

export default function PWACapsule() {
  const { isInstalled, installApp } = usePWA();

  if (isInstalled) return null;

  return (
    <div 
      onClick={installApp}
      className="animate-in"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 999,
        background: 'var(--surface-raised)', border: '1px solid var(--border)',
        cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
      }}
    >
      <IconDownload size={14} style={{ color: 'var(--text-secondary)' }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
        ติดตั้งแอป JamDai ลงเครื่อง
      </span>
    </div>
  );
}
