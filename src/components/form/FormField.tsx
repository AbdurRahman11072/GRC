'use client';

import React from 'react';
import { Input, InputProps } from '../ui/Input';
import type { AnyFieldApi } from '@tanstack/react-form';

export interface FormFieldProps extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  field: AnyFieldApi;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  label,
  helperText,
  ...inputProps
}) => {
  const isTouched = field.state.meta.isTouched;
  const errors = field.state.meta.errors;
  const firstError = isTouched && errors.length > 0 ? String(errors[0]) : undefined;

  return (
    <Input
      name={field.name}
      value={field.state.value ?? ''}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      label={label}
      error={firstError}
      helperText={helperText}
      {...inputProps}
    />
  );
};

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  field: AnyFieldApi;
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  field,
  label,
  error,
  helperText,
  className = '',
  rows = 3,
  ...textareaProps
}) => {
  const isTouched = field.state.meta.isTouched;
  const errors = field.state.meta.errors;
  const firstError = error || (isTouched && errors.length > 0 ? String(errors[0]) : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        name={field.name}
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        rows={rows}
        className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border ${
          firstError
            ? 'border-rose-400 focus:ring-rose-500/20'
            : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
        } text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${className}`}
        {...textareaProps}
      />
      {firstError ? (
        <p className="text-xs text-rose-600 font-medium">{firstError}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
