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

    switch (user.role) {
      case 'manager':
        redirect('/dashboard/manager');
        // ESLint requires a break statement, but redirect prevents this from executing
        break;
      case 'leader':
        redirect('/dashboard/leader');
        break;
      case 'agent':
        redirect('/dashboard/agent');
        break;
      default:
        throw new Error('Invalid user role');
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    return <div>An error occurred: {(error as Error).message}</div>;
  }

  // This line will never be reached due to redirects or error handling
  return null;
}