'use client';

import { useState } from 'react';
import { AIAlert } from '@/lib/hooks/useAIAlert';
import { IconX, IconSparkle, IconClock, IconBook, IconBell, IconChevronDown, IconAlertCircle } from './Icons';

interface AIAlertCardProps {
  alerts: AIAlert[];
  loading: boolean;
  onDismiss: (index: number) => void;
}

export default function AIAlertCard({ alerts, loading, onDismiss }: AIAlertCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="ai-alert-loading" style={{ marginBottom: 16 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent)', flexShrink: 0,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="ai-alert-loading-shimmer" style={{ width: '70%' }} />
          <div className="ai-alert-loading-shimmer" style={{ width: '45%' }} />
        </div>
      </div>
    );
  }

  if (alerts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <IconClock size={16} />;
      case 'class': return <IconBook size={16} />;
      case 'insight': return <IconSparkle size={16} />;
      default: return <IconBell size={16} />;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'สำคัญเร่งด่วน';
      case 'medium': return 'แนะนำ';
      case 'low': return 'ข้อมูลน่าสนใจ';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px', marginBottom: -4 }}>
        <IconSparkle size={14} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          AI สรุปสำหรับคุณ
        </span>
      </div>
      
      {alerts.map((alert, i) => {
        const isExpanded = expandedIndex === i;
        
        return (
          <div
            key={i}
            className={`ai-summary-card urgency-${alert.urgency} ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setExpandedIndex(isExpanded ? null : i)}
            style={{ 
              animationDelay: `${i * 80}ms`,
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div className="ai-summary-header" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="ai-summary-icon">
                {getIcon(alert.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span className="ai-summary-badge">{getUrgencyLabel(alert.urgency)}</span>
                  {alert.urgency === 'high' && <IconAlertCircle size={10} style={{ color: 'var(--danger)' }} />}
                </div>
                <div className="ai-summary-message">{alert.message}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  className="ai-summary-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(i);
                  }}
                  aria-label="ปิด"
                >
                  <IconX size={14} />
                </button>
                <div style={{ 
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', 
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  color: 'var(--text-muted)',
                  display: 'flex'
                }}>
                  <IconChevronDown size={16} />
                </div>
              </div>
            </div>

            {isExpanded && alert.details && (
              <div className="ai-summary-details animate-in" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {alert.details}
                </p>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                   <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', opacity: 0.8 }}>
                     ดูรายละเอียดเพิ่มเติมในระบบ AI →
                   </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .ai-summary-card {
          background: var(--surface-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 18px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          overflow: hidden;
        }

        .ai-summary-card:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 12px 30px rgba(255, 107, 26, 0.15);
          border-color: var(--accent);
        }

        .ai-summary-card.expanded {
          border-color: var(--accent);
          background: linear-gradient(135deg, var(--surface-card) 0%, var(--accent-soft) 100%);
          box-shadow: 0 16px 40px rgba(255, 107, 26, 0.18);
        }

        .ai-summary-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--accent-soft);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(255, 107, 26, 0.1);
        }

        .ai-summary-card.expanded .ai-summary-icon {
          background: var(--accent);
          color: white;
          transform: rotate(5deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 107, 26, 0.3);
        }

        .urgency-high {
          background: linear-gradient(135deg, #FFF5F2 0%, #FFF0E6 100%);
          border-left: 4px solid var(--accent) !important;
        }
        
        [data-theme="dark"] .urgency-high {
           background: linear-gradient(135deg, #2A1A0A 0%, #1A1208 100%);
        }

        .ai-summary-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--accent);
          opacity: 0.9;
        }

        .ai-summary-message {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .ai-summary-btn-icon {
          background: rgba(0,0,0,0.03);
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        [data-theme="dark"] .ai-summary-btn-icon {
          background: rgba(255,255,255,0.05);
        }

        .ai-summary-btn-icon:hover {
          background: var(--danger-light);
          color: var(--danger);
          transform: scale(1.1);
        }

        .ai-summary-details {
          animation: expandDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes expandDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
