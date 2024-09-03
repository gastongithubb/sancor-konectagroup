/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      select: { id: true, name: true },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Error fetching teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { name } = body;

    if (!name) {
      console.log('Team name is missing');
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    console.log('Attempting to find default leader');
    const defaultLeader = await prisma.user.findFirst({
      where: { role: 'leader' },
    });

    if (!defaultLeader) {
      console.log('No default leader found');
      return NextResponse.json({ error: 'No default leader found' }, { status: 400 });
    }

    console.log('Creating new team');
    const newTeam = await prisma.team.create({
      data: {
        name,
        leader: {
          connect: { id: defaultLeader.id },
        },
      },
    });

    console.log('New team created:', newTeam);
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/teams:', error);
    return NextResponse.json({ error: 'Error creating team', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}