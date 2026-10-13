'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo' | 'cyan';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  info: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  neutral: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  cyan: {
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    dot: 'bg-cyan-600',
  },
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1 rounded font-medium',
  sm: 'px-2 py-0.5 text-xs gap-1.5 rounded-md font-medium',
  md: 'px-2.5 py-1 text-xs gap-1.5 rounded-md font-semibold',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center border select-none ${styles.badge} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
};
