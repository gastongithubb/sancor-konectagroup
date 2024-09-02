// app/dashboard/leader/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TeamPerformance from "@/app/components/TeamPerfomance";
import CaseDistribution from "@/app/components/CaseDistribution";

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'leader') {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    include: { 
      leadingTeam: {
        include: {
          members: true,
        }
      }
    }
  });

  if (!user || !user.leadingTeam) {
    return <div>No team found for this leader</div>;
  }

  return (
    <div>
      <h1>Team Leader Dashboard</h1>
      <h2>Team: {user.leadingTeam.name}</h2>
      
      <TeamPerformance teamId={user.leadingTeam.id} />
      <CaseDistribution teamId={user.leadingTeam.id} />
    </div>
  );
}