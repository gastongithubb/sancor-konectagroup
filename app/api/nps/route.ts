// app/api/nps/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  const npsData = await prisma.nPS.findMany({
    where: { teamId: parseInt(teamId) },
    orderBy: { date: 'asc' },
    select: { date: true, score: true },
  });

  return NextResponse.json(npsData);
}