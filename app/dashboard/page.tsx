// app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  switch (user.role) {
    case 'manager':
      redirect('/dashboard/manager');
    case 'leader':
      redirect('/dashboard/leader');
    case 'agent':
      redirect('/dashboard/agent');
    default:
      return <div>Invalid user role</div>;
  }
}