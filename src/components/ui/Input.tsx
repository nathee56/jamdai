import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-secondary ml-1">{label}</label>}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-muted flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full bg-surface-card border rounded-full px-5 h-12 text-[15px] font-medium text-primary
              outline-none transition-all duration-200
              placeholder:text-muted
              focus:border-accent focus:ring-4 focus:ring-accent-soft
              disabled:opacity-60 disabled:cursor-not-allowed
              ${error ? 'border-danger focus:border-danger focus:ring-danger-light' : 'border-border-strong hover:border-text-muted'}
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 text-muted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && <p className="text-xs text-danger ml-2 mt-0.5 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
