'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { LogIn, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '../../../store/api/authApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        const response = await login(value).unwrap();
        if (response.success) {
          router.push('/projects');
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to sign in. Please check your credentials.');
      }
    },
  });

  return (
    <Card className="border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl">Sign in to your account</CardTitle>
        <CardDescription>
          Enter your organization credentials to access audit workspaces.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Email is required'
                  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? 'Please enter a valid email address'
                  : undefined,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Work Email"
                type="email"
                placeholder="auditor@firm.com"
                autoComplete="email"
                required
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? 'Password is required' : undefined),
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            )}
          </form.Field>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Need to onboard an audit firm or enterprise?{' '}
            <Link
              href="/register"
              className="text-cyan-700 hover:text-cyan-800 font-medium transition-colors"
            >
              Register Organization
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
