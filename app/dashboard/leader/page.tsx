// app/dashboard/leader/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';
import TeamPerformance from '@/components/TeamPerfomance';
import CaseDistribution from '@/components/CaseDistribution';
import { revalidateData } from '@/lib/revalidateHelper';

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'leader') {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    include: {
      leadingTeam: {
        include: {
          members: true,
          nps: {
            take: 1,
            orderBy: { date: 'desc' },
          },
          _count: {
            select: { members: true },
          },
        },
      },
    },
  });

  if (!user || !user.leadingTeam) {
    return <div>No team found for this leader</div>;
  }

  const team = {
    id: user.leadingTeam.id,
    name: user.leadingTeam.name,
    _count: user.leadingTeam._count,
    nps: user.leadingTeam.nps,
  };

  // Revalidar los datos
  await revalidateData('/dashboard/leader');

  return (
    <div>
      <h1>Team Leader Dashboard</h1>
      <h2>Team: {team.name}</h2>

      <TeamPerformance teams={[team]} />
      <CaseDistribution teamId={team.id} />
    </div>
  );
}