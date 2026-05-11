'use client';

import { AIAlert } from '@/lib/hooks/useAIAlert';
import { IconX } from './Icons';

interface AIAlertCardProps {
  alerts: AIAlert[];
  loading: boolean;
  onDismiss: (index: number) => void;
}

export default function AIAlertCard({ alerts, loading, onDismiss }: AIAlertCardProps) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`ai-alert ai-alert-${alert.urgency}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="ai-alert-dot" />
          <span className="ai-alert-message">{alert.message}</span>
          <button
            className="ai-alert-dismiss"
            onClick={() => onDismiss(i)}
            aria-label="ปิดการแจ้งเตือน"
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
