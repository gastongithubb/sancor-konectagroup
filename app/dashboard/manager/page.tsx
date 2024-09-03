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
          <Link href="/dashboard/preview/leader" className="text-green-500 hover:underline">
            Preview Leader Dashboard
          </Link>
          <Link href="/dashboard/preview/agent" className="text-purple-500 hover:underline">
            Preview Agent Dashboard
          </Link>
        </div>

        <GlobalStatistics />
        <TeamPerformance teams={teams} />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Dashboard Previews</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Lider Dashboard</h3>
              <iframe src="/dashboard/leader" className="w-full h-64 border-0"></iframe>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Representante Dashboard</h3>
              <iframe src="/dashboard/agent" className="w-full h-64 border-0"></iframe>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return <div>Error loading dashboard data. Please try again later.</div>;
  } finally {
    await prisma.$disconnect();
  }
}