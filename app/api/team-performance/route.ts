// app/api/team-performance/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== 'leader') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
      return NextResponse.json({ error: 'No team found for this leader' }, { status: 404 });
    }

    return NextResponse.json(user.leadingTeam);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}