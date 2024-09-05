// app/case/[id]/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth'; // Importación corregida
import UpdateCaseForm from '@/components/UpdateCaseForm';
import CommentList from '@/components/CommentList';

export default async function CaseDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const case_ = await prisma.case.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      assignee: true,
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!case_) {
    return <div>Case not found</div>;
  }

  return (
    <div>
      <h1>Case: {case_.title}</h1>
      <p>Status: {case_.status}</p>
      <p>Assigned to: {case_.assignee.email}</p>
      <p>Created at: {case_.createdAt.toLocaleString()}</p>
      <p>Description: {case_.description}</p>

      <UpdateCaseForm caseId={case_.id} currentStatus={case_.status} />
      <CommentList comments={case_.comments} />
    </div>
  );
}
