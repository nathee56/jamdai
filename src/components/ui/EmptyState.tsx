import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-3xl bg-surface-base/50"
    >
      <div className="w-16 h-16 mb-4 rounded-2xl bg-surface-card shadow-sm border border-border flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-secondary max-w-[260px] mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
