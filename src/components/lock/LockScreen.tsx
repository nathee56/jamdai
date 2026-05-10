'use client';

import { useState, useRef, useEffect } from 'react';
import { usePin } from '@/lib/hooks/usePin';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LockScreen({ children }: { children: React.ReactNode }) {
  const { hasPin, isLocked, verifyPin, clearPin, loading } = usePin();
  const { isLocalMode } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const PIN_LENGTH = 6;

  useEffect(() => {
    if (!isLocked || !hasPin || loading || verifying) return;
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        setPin(prev => {
          if (prev.length >= PIN_LENGTH) return prev;
          const newPin = prev + e.key;
          if (newPin.length === PIN_LENGTH) {
            setTimeout(() => handleSubmit(newPin), 50);
          }
          return newPin;
        });
        setError('');
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
        setError('');
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isLocked, hasPin, loading, verifying]);

  if (loading) return null;
  if (!hasPin || !isLocked) return <>{children}</>;

  const handleNumpadClick = (num: string) => {
    if (verifying || pin.length >= PIN_LENGTH) return;
    const newPin = pin + num;
    setPin(newPin);
    setError('');
    if (newPin.length === PIN_LENGTH) {
      setTimeout(() => handleSubmit(newPin), 50);
    }
  };

  const handleBackspaceClick = () => {
    if (verifying || pin.length === 0) return;
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (pinValue?: string) => {
    const p = pinValue || pin;
    if (p.length < 4) {
      setError('กรุณากรอกรหัสผ่านอย่างน้อย 4 หลัก');
      return;
    }
    setVerifying(true);
    const ok = await verifyPin(p);
    setVerifying(false);
    if (!ok) {
      setError('รหัสผ่านไม่ถูกต้อง');
      setPin('');
    }
  };

  const handleForgotPin = async () => {
    if (isLocalMode) {
      if (confirm('การรีเซ็ตรหัสผ่านจะล้างข้อมูลทั้งหมดในเครื่อง (To-Do, โน้ต, การตั้งค่า) คุณต้องการดำเนินการต่อหรือไม่?')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      await clearPin();
      setShowForgot(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img src="/logo.png" alt="JamDai" style={{ height: 64, objectFit: 'contain' }} />
        </div>

        {/* Lock Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 999, margin: '0 auto 24px',
          background: 'var(--accent-soft)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          กรอกรหัสผ่านเพื่อเข้าใช้งาน
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-hint)', marginBottom: 32 }}>
          ป้อน PIN {PIN_LENGTH} หลักของคุณ
        </p>

        {/* PIN Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 16, height: 16,
                borderRadius: '50%',
                background: i < pin.length ? 'var(--accent)' : 'transparent',
                border: `2px solid ${error ? 'var(--danger)' : i < pin.length ? 'var(--accent)' : 'var(--border-strong)'}`,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: i < pin.length ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        {!showForgot && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', maxWidth: 280, margin: '0 auto 24px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => handleNumpadClick(num.toString())} className="numpad-btn">
                {num}
              </button>
            ))}
            <div />
            <button onClick={() => handleNumpadClick('0')} className="numpad-btn">0</button>
            <button onClick={handleBackspaceClick} className="numpad-btn" style={{ background: 'transparent' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{
            fontSize: 13, color: 'var(--danger)', fontWeight: 600,
            marginBottom: 16, animation: 'shake 0.3s ease-in-out',
          }}>
            {error}
          </p>
        )}

        {/* Verifying state */}
        {verifying && (
          <p style={{ fontSize: 13, color: 'var(--text-hint)', marginBottom: 16 }}>
            กำลังตรวจสอบ...
          </p>
        )}

        {/* Forgot PIN */}
        {!showForgot ? (
          <button
            onClick={() => setShowForgot(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-hint)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              padding: '8px 16px', marginTop: 8,
            }}
          >
            ลืมรหัสผ่าน?
          </button>
        ) : (
          <div style={{
            marginTop: 16, padding: 20, borderRadius: 24,
            background: 'var(--surface-card)', border: '1px solid var(--border)',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {isLocalMode ? 'รีเซ็ตรหัสผ่าน' : 'ล้างรหัสผ่าน'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {isLocalMode
                ? 'การรีเซ็ตจะล้างข้อมูลทั้งหมดในเครื่อง (To-Do, โน้ต, การตั้งค่า) ไม่สามารถกู้คืนได้'
                : 'ระบบจะล้าง PIN ออก คุณสามารถตั้ง PIN ใหม่ได้ในหน้าตั้งค่า'
              }
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowForgot(false)}
                className="btn-ghost"
                style={{ flex: 1, height: 44, borderRadius: 999, justifyContent: 'center' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleForgotPin}
                className="btn-primary"
                style={{
                  flex: 1, height: 44, borderRadius: 999, justifyContent: 'center',
                  background: 'var(--danger)',
                }}
              >
                {isLocalMode ? 'ล้างข้อมูลทั้งหมด' : 'ล้าง PIN'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
        }
        .numpad-btn {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: none;
          background: var(--surface-card);
          color: var(--text-primary);
          font-size: 28px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          margin: 0 auto;
        }
        .numpad-btn:active {
          background: var(--surface-raised);
          transform: scale(0.92);
        }
      `}</style>
    </div>
  );
}
