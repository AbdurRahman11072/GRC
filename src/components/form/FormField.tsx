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
