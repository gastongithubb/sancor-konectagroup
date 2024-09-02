// app/api/cases/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const caseId = parseInt(params.id);
  const { status, comment } = await request.json();

  try {
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        status,
        description: comment ? `${comment}\n\n${new Date().toISOString()}` : undefined,
      },
    });

    // Si tienes un modelo de comentarios separado, puedes crear un nuevo comentario así:
    // if (comment) {
    //   await prisma.comment.create({
    //     data: {
    //       content: comment,
    //       caseId: caseId,
    //       createdBy: 'User' // Reemplaza con el ID de usuario real de la sesión
    //     }
    //   });
    // }

    return NextResponse.json(updatedCase);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating case' }, { status: 500 });
  }
}
