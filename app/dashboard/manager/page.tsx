// app/dashboard/manager/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';
import GlobalStatistics from '@/app/components/GlobalStatics';
import TeamPerformance from '@/app/components/TeamPerfomance';

interface ExtendedUser {
  role?: string;
}

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as ExtendedUser).role !== 'manager') {
    redirect('/auth/signin');
  }

  try {
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
        <div className="space-x-4 mb-6">
          <Link href="/dashboard/teams" className="text-blue-500 hover:underline">
            Manage Teams
          </Link>
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Register New User
          </Link>
        </div>

        <GlobalStatistics />
        <TeamPerformance teams={teams} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return <div>Error loading dashboard data. Please try again later.</div>;
  } finally {
    await prisma.$disconnect();
  }
}