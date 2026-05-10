import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export default function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md',
  className = '', 
  ...props 
}: BadgeProps) {
  
  const variants: Record<BadgeVariant, string> = {
    primary: "bg-orange-light text-accent",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
    warning: "bg-warning-light text-warning",
    neutral: "bg-surface-raised text-secondary",
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
