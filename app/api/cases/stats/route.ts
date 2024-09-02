// app/api/cases/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

interface CaseStats {
  open: number;
  inProgress: number;
  closed: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  const stats = await prisma.case.groupBy({
    by: ['status'],
    where: {
      assignee: {
        teamId: parseInt(teamId)
      }
    },
    _count: {
      _all: true
    }
  });

  const formattedStats: CaseStats = {
    open: 0,
    inProgress: 0,
    closed: 0
  };

  stats.forEach(stat => {
    switch (stat.status as CaseStatus) {
      case 'OPEN':
        formattedStats.open = stat._count._all;
        break;
      case 'IN_PROGRESS':
        formattedStats.inProgress = stat._count._all;
        break;
      case 'CLOSED':
        formattedStats.closed = stat._count._all;
        break;
    }
  });

  return NextResponse.json(formattedStats);
}