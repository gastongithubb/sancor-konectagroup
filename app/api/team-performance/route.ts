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
    return NextResponse.json({ error: 'Unauthorized: No session or user' }, { status: 401 });
  }

  const user = session.user as any;
  console.log('User from session:', JSON.stringify(user, null, 2));

  // Check if the user has a role
  if (!user.role) {
    console.log('Forbidden: User has no role');
    return NextResponse.json({ error: 'Forbidden: User has no role assigned' }, { status: 403 });
  }

  try {
    let teamData;
    
    // If user is a leader, find their team
    if (user.role === 'leader') {
      teamData = await prisma.team.findFirst({
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
    } 
    // If user is an admin, find the team by teamId query parameter
    else if (user.role === 'admin') {
      const teamId = req.nextUrl.searchParams.get('teamId');
      if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required for admin users' }, { status: 400 });
      }
      teamData = await prisma.team.findUnique({
        where: { id: parseInt(teamId) },
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
    } else {
      console.log(`Forbidden: User role ${user.role} is not allowed to access this data`);
      return NextResponse.json({ error: 'Forbidden: You do not have permission to access this data' }, { status: 403 });
    }

    if (!teamData) {
      console.log(`No team found for user with id ${user.id} and role ${user.role}`);
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    console.log('Successfully fetched team data');
    return NextResponse.json(teamData);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}