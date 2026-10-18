'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useUpdateMeMutation } from '../../store/api/authApi';
import type { IUserProfile } from '../../types/auth.types';

interface ProfileInfoCardProps {
  user: IUserProfile | null;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user }) => {
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    nid: user?.nid || '',
    designation: user?.designation || '',
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        nid: user.nid || '',
        designation: user.designation || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    try {
      await updateMe({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        nid: formData.nid.trim() || undefined,
        designation: formData.designation.trim() || undefined,
      }).unwrap();

      setSuccessMsg('Profile details updated successfully');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to update profile details');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your name, designation, and contact details</CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Tariqul Islam"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <div>
              <Input
                label="Email Address"
                value={user?.email || ''}
                readOnly
                disabled
                className="bg-slate-100/80 cursor-not-allowed text-slate-500"
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Email is bound to your account login credentials"
              />
            </div>

            <Input
              label="Designation / Role"
              value={formData.designation}
              onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
              placeholder="e.g. Lead Information Systems Auditor"
              leftIcon={<Briefcase className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. +880 1711-000000"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="md:col-span-2">
              <Input
                label="National ID / Identification No."
                value={formData.nid}
                onChange={(e) => setFormData((prev) => ({ ...prev, nid: e.target.value }))}
                placeholder="e.g. 199026925..."
                leftIcon={<CreditCard className="w-4 h-4" />}
                helperText="Used for regulatory compliance audit sign-offs"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save Profile Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
