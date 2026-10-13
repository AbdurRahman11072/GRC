'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'cyan';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-indigo-600',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300',
  outline:
    'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300',
  destructive:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-600',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
  cyan:
    'bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-xs border border-cyan-600',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-md font-medium',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg font-medium',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg font-medium',
  lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl font-semibold',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
