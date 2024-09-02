// app/dashboard/my-cases/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ReportCase from "@/app/components/ReportCase";
import UpdateCase from "@/app/components/UpdateCase";

export default async function AgentCases() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'agent') {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: (session.user as any).email },
    include: { 
      assignedCases: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>My Cases</h1>
      
      <h2>Report New Case</h2>
      <ReportCase userId={user.id} />

      <h2>My Assigned Cases</h2>
      {user.assignedCases.map(case_ => (
        <div key={case_.id}>
          <h3>{case_.title}</h3>
          <p>Status: {case_.status}</p>
          <p>Created: {case_.createdAt.toLocaleString()}</p>
          <p>Description: {case_.description}</p>
          <UpdateCase caseId={case_.id} currentStatus={case_.status} />
        </div>
      ))}
    </div>
  );
}