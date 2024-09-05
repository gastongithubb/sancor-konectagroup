'use client';

import React, { ReactNode } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return {
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    status,
    logout,
  };
}