// app/components/Navigation.tsx
'use client'

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = (session.user as any).role;

  return (
    <nav>
      <ul>
        {role === 'manager' && (
          <>
            <li><Link href="/dashboard/manager">Dashboard</Link></li>
            <li><Link href="/dashboard/teams">Manage Teams</Link></li>
            <li><Link href="/auth/register">Register User</Link></li>
          </>
        )}
        {role === 'leader' && (
          <>
            <li><Link href="/dashboard/leader">Dashboard</Link></li>
            <li><Link href="/dashboard/team-performance">Team Performance</Link></li>
          </>
        )}
        {role === 'agent' && (
          <>
            <li><Link href="/dashboard/agent">Dashboard</Link></li>
            <li><Link href="/dashboard/my-cases">My Cases</Link></li>
          </>
        )}
        <li><button onClick={() => signOut()}>Sign Out</button></li>
      </ul>
    </nav>
  );
}