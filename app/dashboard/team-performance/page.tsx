// app/dashboard/team-performance/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';
import NPSChart from '@/components/NpsCharts';

export default async function TeamPerformance() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'leader') {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    include: {
      leadingTeam: {
        include: {
          members: {
            include: {
              assignedCases: {
                where: {
                  createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                  },
                },
              },
            },
          },
          nps: {
            take: 30,
            orderBy: { date: 'desc' },
          },
        },
      },
    },
  });

  if (!user || !user.leadingTeam) {
    return <div>No team found for this leader</div>;
  }

  const memberPerformance = user.leadingTeam.members.map((member) => ({
    name: member.email,
    casesHandled: member.assignedCases.length,
    averageResolutionTime:
      member.assignedCases.reduce(
        (acc, curr) => acc + (curr.updatedAt.getTime() - curr.createdAt.getTime()),
        0
      ) /
      member.assignedCases.length /
      (1000 * 60 * 60), // in hours
  }));

  return (
    <div>
      <h1>Team Performance</h1>
      <h2>Team: {user.leadingTeam.name}</h2>

      <h3>NPS Over Time</h3>
      <NPSChart teamId={user.leadingTeam.id} />

      <h3>Member Performance (Last 30 Days)</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Cases Handled</th>
            <th>Avg. Resolution Time (hours)</th>
          </tr>
        </thead>
        <tbody>
          {memberPerformance.map((member) => (
            <tr key={member.name}>
              <td>{member.name}</td>
              <td>{member.casesHandled}</td>
              <td>{member.averageResolutionTime.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
