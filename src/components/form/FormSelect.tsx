'use client';

import React from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

export interface FormSelectOption {
  label: string;
  value: string | number;
}

export interface FormSelectProps {
  field: AnyFieldApi;
  label?: string;
  options: FormSelectOption[];
  placeholder?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  field,
  label,
  options,
  placeholder = 'Select an option',
  helperText,
  className = '',
  disabled = false,
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
      <div className="relative">
        <select
          name={field.name}
          value={field.state.value ?? ''}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          className={`w-full bg-slate-900/90 border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
            firstError
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/40 text-rose-100'
              : 'border-slate-800 focus:border-indigo-500/80 focus:ring-indigo-500/40'
          } ${className}`}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
              className="bg-slate-900 text-slate-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {firstError ? (
        <p className="text-xs text-rose-400 font-medium tracking-tight">{firstError}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
