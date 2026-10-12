'use client';

import React from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  field: AnyFieldApi;
  label?: string;
  helperText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  field,
  label,
  helperText,
  className = '',
  rows = 3,
  ...props
}) => {
  const isTouched = field.state.meta.isTouched;
  const errors = field.state.meta.errors;
  const firstError = isTouched && errors.length > 0 ? String(errors[0]) : undefined;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <textarea
        name={field.name}
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        rows={rows}
        className={`w-full bg-slate-900/90 border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 resize-y ${
          firstError
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/40 text-rose-100'
            : 'border-slate-800 focus:border-indigo-500/80 focus:ring-indigo-500/40'
        } ${className}`}
        {...props}
      />
      {firstError ? (
        <p className="text-xs text-rose-400 font-medium tracking-tight">{firstError}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
