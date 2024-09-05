/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

export async function GET(req: NextRequest) {
  console.log('Received request to /api/team-performance');
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log('Unauthorized: No session or user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  console.log('User from session:', JSON.stringify(user, null, 2));

  if (user.role !== 'leader') {
    console.log(`Forbidden: User role is ${user.role}, expected 'leader'`);
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
      console.log(`No team found for leader with id ${user.id}`);
      return NextResponse.json({ error: 'No team found for this leader' }, { status: 404 });
    }

    console.log('Successfully fetched team data');
    return NextResponse.json(teamData);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}