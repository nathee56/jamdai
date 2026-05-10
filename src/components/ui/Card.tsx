import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ 
  children, 
  hoverEffect = false, 
  padding = 'md',
  className = '',
  ...props 
}: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyle = `bg-surface-card border border-border rounded-3xl transition-all duration-300`;
  const hoverStyle = hoverEffect ? 'hover:-translate-y-1 hover:shadow-lg hover:shadow-border-strong/50 hover:border-border-strong' : '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${baseStyle} ${paddings[padding]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children as React.ReactNode}
    </motion.div>
  );
}
