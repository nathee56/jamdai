'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-soft disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-orange-600 shadow-md shadow-accent/20",
    secondary: "bg-surface-card text-primary border border-border-strong hover:bg-surface-raised",
    ghost: "bg-transparent text-secondary hover:bg-surface-raised hover:text-primary",
    danger: "bg-danger text-white hover:bg-rose-600 shadow-md shadow-danger/20",
  };
  
  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2 min-w-[40px] min-h-[40px] flex items-center justify-center",
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { y: -1, scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.96 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children as React.ReactNode}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
}
