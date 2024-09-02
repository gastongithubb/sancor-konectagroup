// app/dashboard/manager/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';
import GlobalStatistics from '@/app/components/GlobalStatics';
import TeamPerformance from '@/app/components/TeamPerfomance';

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'manager') {
    redirect('/auth/signin');
  }

  const teams = await prisma.team.findMany({
    include: {
      _count: {
        select: { members: true },
      },
      nps: {
        take: 1,
        orderBy: { date: 'desc' },
      },
    },
  });

  return (
    <div>
      <h1>Manager Dashboard</h1>
      <Link href="/dashboard/teams">Manage Teams</Link>
      <Link href="/auth/register">Register New User</Link>

      <GlobalStatistics />
      <TeamPerformance teams={teams} />
    </div>
  );
}
