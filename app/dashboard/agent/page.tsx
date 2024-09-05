// app/dashboard/agent/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';
import CaseList from '@/components/CaseList';
import ReportCase from '@/components/ReportCase';
import { revalidateData } from '@/lib/revalidateHelper';

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'agent') {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    include: {
      team: true,
      assignedCases: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user || !user.team) {
    return <div>No team found for this agent</div>;
  }

  // Revalidar los datos
  await revalidateData('/dashboard/agent');

  return (
    <div>
      <h1>Agent Dashboard</h1>
      <h2>Team: {user.team.name}</h2>

      <ReportCase userId={user.id} />
      <CaseList cases={user.assignedCases} />
    </div>
  );
}