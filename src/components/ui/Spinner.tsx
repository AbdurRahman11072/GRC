'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 text-slate-400 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-400 ${sizeClasses[size]}`} />
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
    </div>
  );
};
