// app/api/cases/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { title, description, assignedTo } = await request.json();

  try {
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        status: 'Open',
        assignedTo,
      },
    });
    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating case' }, { status: 500 });
  }
}
