// app/api/statistics/global/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalCases = await prisma.case.count();
    const openCases = await prisma.case.count({ where: { status: 'OPEN' } });
    const npsScores = await prisma.nPS.findMany({ select: { score: true } });
    const averageNPS = npsScores.reduce((sum, nps) => sum + nps.score, 0) / npsScores.length;

    return NextResponse.json({
      totalCases,
      openCases,
      averageNPS
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching global statistics' }, { status: 500 });
  }
}