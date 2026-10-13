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
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
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
          className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-1 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
            firstError
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
          } ${className}`}
        >
          {placeholder && (
            <option value="" disabled className="bg-white text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
              className="bg-white text-slate-900"
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
