'use client';

import React from 'react';
import { useGetMeQuery } from '../store/api/authApi';

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  // Query /auth/me on app load to restore user profile and organization list from httpOnly cookie
  useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  return <>{children}</>;
}
