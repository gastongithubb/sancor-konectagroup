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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return <div>User not found</div>;
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
      return <div>Invalid user role</div>;
  }

  // This line will never be reached due to redirects or the default case
  return null;
}