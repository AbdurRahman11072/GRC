'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useRegisterMutation } from '../../../store/api/authApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/form/FormField';
import { FormSelect } from '../../../components/form/FormSelect';

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      designation: '',
      orgName: '',
      orgType: 'AUDIT_FIRM',
      orgPhone: '',
      orgEmail: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        const response = await registerUser({
          name: value.name,
          email: value.email,
          password: value.password,
          designation: value.designation || undefined,
          organization: {
            orgName: value.orgName,
            orgType: value.orgType,
            orgPhone: value.orgPhone || undefined,
            orgEmail: value.orgEmail || undefined,
          },
        }).unwrap();

        if (response.success) {
          router.push('/projects');
        }
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        setErrorMessage(error.data?.message || error.message || 'Failed to register organization. Please try again.');
      }
    },
  });

  return (
    <Card className="border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl">Register Organization & Owner</CardTitle>
        <CardDescription>
          Create a tenant boundary for your audit firm and initialize the owner account.
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
          {/* Organization Details */}
          <div className="space-y-3 pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              1. Organization Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <form.Field
                name="orgName"
                validators={{
                  onChange: ({ value }) => (!value ? 'Organization name is required' : undefined),
                }}
              >
                {(field) => (
                  <FormField
                    field={field}
                    label="Organization Name"
                    placeholder="e.g. KPMG Bangladesh"
                    required
                  />
                )}
              </form.Field>

              <form.Field name="orgType">
                {(field) => (
                  <FormSelect
                    field={field}
                    label="Organization Type"
                    options={[
                      { label: 'Audit Firm', value: 'AUDIT_FIRM' },
                      { label: 'Regulator Body', value: 'REGULATOR' },
                      { label: 'Auditee Enterprise', value: 'ENTERPRISE' },
                    ]}
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <form.Field name="orgEmail">
                {(field) => (
                  <FormField
                    field={field}
                    label="Official Org Email"
                    type="email"
                    placeholder="contact@firm.com"
                  />
                )}
              </form.Field>

              <form.Field name="orgPhone">
                {(field) => (
                  <FormField
                    field={field}
                    label="Org Telephone"
                    placeholder="+880 1700 000000"
                  />
                )}
              </form.Field>
            </div>
          </div>

          {/* Lead User Account */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              2. Owner Account Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => (!value ? 'Full name is required' : undefined),
                }}
              >
                {(field) => (
                  <FormField
                    field={field}
                    label="Full Name"
                    placeholder="Lead Auditor Name"
                    autoComplete="name"
                    required
                  />
                )}
              </form.Field>

              <form.Field name="designation">
                {(field) => (
                  <FormField
                    field={field}
                    label="Designation"
                    placeholder="Partner / Lead Auditor"
                  />
                )}
              </form.Field>
            </div>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? 'Work email is required'
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
                onChange: ({ value }) =>
                  !value
                    ? 'Password is required'
                    : value.length < 6
                    ? 'Password must be at least 6 characters'
                    : undefined,
              }}
            >
              {(field) => (
                <FormField
                  field={field}
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                />
              )}
            </form.Field>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Register & Initialize Workspace
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Already have an active tenant?{' '}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
