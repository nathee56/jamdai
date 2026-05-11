'use client';

import { useState } from 'react';
import { IconSparkle, IconSend, IconSearch, IconChevronDown, IconClock } from './Icons';
import { AIAlert } from '@/lib/hooks/useAIAlert';
import { useRouter } from 'next/navigation';

interface AIBannerProps {
  pendingCount: number;
  alerts: AIAlert[];
  loading: boolean;
  onDismiss: (index: number) => void;
}

export default function AIBanner({ pendingCount, alerts, loading, onDismiss }: AIBannerProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleAskAI = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    
    // Store input in session and redirect to AI page
    sessionStorage.setItem('ai_initial_query', input.trim());
    router.push('/app/ai');
  };

  return (
    <div className="ai-banner-container animate-in">
      <div 
        className={`ai-banner ${isExpanded ? 'expanded' : ''}`}
        onClick={() => alerts.length > 0 && setIsExpanded(!isExpanded)}
        style={{ cursor: alerts.length > 0 ? 'pointer' : 'default' }}
      >
        <div className="ai-banner-content">
          <div className="ai-banner-header">
            <div className="ai-banner-icon">
              <IconSparkle size={24} />
            </div>
            <div className="ai-banner-text" style={{ flex: 1 }}>
              <h2>สรุปภาพรวมวันนี้</h2>
              <p>คุณมีงานค้าง {pendingCount} รายการ</p>
            </div>
            {alerts.length > 0 && (
              <div className={`expand-indicator ${isExpanded ? 'active' : ''}`}>
                 <IconChevronDown size={24} />
              </div>
            )}
          </div>

          {isExpanded && alerts.length > 0 && (
            <div className="ai-expanded-content">
              <div className="ai-divider" />
              <div className="ai-alerts-list">
                {alerts.map((alert, i) => (
                  <div key={i} className={`ai-alert-item urgency-${alert.urgency}`}>
                    <div className="ai-alert-type-icon">
                       {alert.type === 'deadline' ? <IconClock size={16} /> : <IconSparkle size={16} />}
                    </div>
                    <div className="ai-alert-msg-box">
                      <div className="ai-alert-main-msg">{alert.message}</div>
                      <div className="ai-alert-sub-details">{alert.details}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ai-divider" />
            </div>
          )}

          <form onSubmit={handleAskAI} className="ai-banner-input-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="ai-banner-input-inner">
              <IconSearch size={18} className="ai-input-icon" />
              <input 
                type="text" 
                placeholder="ถาม AI เกี่ยวกับงานของคุณ..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="ai-banner-input"
              />
              <button type="submit" className="ai-banner-send">
                <IconSend size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .ai-banner-container {
          margin-bottom: 24px;
        }

        .ai-banner {
          background: linear-gradient(135deg, #FF6B1A 0%, #FF9A5C 100%);
          border-radius: 32px;
          padding: 30px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(255, 107, 26, 0.25);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-banner.expanded {
           box-shadow: 0 20px 60px rgba(255, 107, 26, 0.35);
           transform: scale(1.01);
        }

        [data-theme="dark"] .ai-banner {
          background: linear-gradient(135deg, #2A1A0A 0%, #1A1208 100%);
          border: 1px solid rgba(255, 107, 26, 0.3);
          box-shadow: 0 12px 50px rgba(0, 0, 0, 0.5);
        }

        .ai-banner::before {
          content: '';
          position: absolute;
          top: -15%;
          right: -10%;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .ai-banner-content {
          position: relative;
          z-index: 1;
        }

        .ai-banner-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ai-banner-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .ai-banner-text h2 {
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .ai-banner-text p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.95);
          margin: 4px 0 0;
          font-weight: 600;
        }

        .expand-indicator {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.8;
        }
        .expand-indicator.active {
          transform: rotate(180deg);
        }

        .ai-expanded-content {
          margin-bottom: 24px;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ai-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          margin: 16px 0;
        }

        .ai-alerts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ai-alert-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(255, 255, 255, 0.1);
          padding: 14px;
          border-radius: 16px;
          border-left: 4px solid rgba(255, 255, 255, 0.4);
        }

        .ai-alert-item.urgency-high {
           background: rgba(255, 255, 255, 0.15);
           border-left-color: #fff;
        }

        .ai-alert-type-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ai-alert-main-msg {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .ai-alert-sub-details {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.5;
        }

        .ai-banner-input-inner {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 999px;
          padding: 6px 6px 6px 20px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-banner-input-inner:focus-within {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .ai-input-icon {
          color: rgba(255, 255, 255, 0.8);
          margin-right: 14px;
        }

        .ai-banner-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          height: 48px;
        }

        .ai-banner-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .ai-banner-send {
          width: 48px;
          height: 48px;
          background: white;
          color: var(--accent);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .ai-banner { padding: 24px; border-radius: 28px; }
          .ai-banner-header { gap: 16px; }
          .ai-banner-icon { width: 52px; height: 52px; }
          .ai-banner-text h2 { font-size: 20px; }
          .ai-banner-text p { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
