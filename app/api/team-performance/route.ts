import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any; // Asumiendo que hemos extendido el tipo User

  if (user.role !== 'leader') {
    return NextResponse.json({ error: 'Forbidden: Only team leaders can access this data' }, { status: 403 });
  }

  try {
    const teamData = await prisma.team.findFirst({
      where: { leaderId: parseInt(user.id) },
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
    });

    if (!teamData) {
      return NextResponse.json({ error: 'No team found for this leader' }, { status: 404 });
    }

    return NextResponse.json(teamData);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}