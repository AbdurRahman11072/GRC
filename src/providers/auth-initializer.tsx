'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useGetMeQuery } from '../store/api/authApi';
import { useAppSelector } from '../store/hooks';

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { accessToken } = useAppSelector((state) => state.auth);

  const hasToken = Boolean(
    accessToken ||
      (typeof window !== 'undefined' &&
        localStorage.getItem('zio_access_token'))
  );

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register');

  // Query /auth/me on app load only when authenticated and not on login/register
  useGetMeQuery(undefined, {
    skip: !hasToken || isAuthPage,
    refetchOnMountOrArgChange: true,
  });

  return <>{children}</>;
}
