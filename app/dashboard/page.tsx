// app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error('User not found');
    }
    //no-fallthrough
    switch (user.role) {
      case 'manager':
        redirect('/dashboard/manager');
      case 'leader':
        redirect('/dashboard/leader');
      case 'agent':
        redirect('/dashboard/agent');
      default:
        throw new Error('Invalid user role');
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    return <div>An error occurred: {(error as Error).message}</div>;
  }
}