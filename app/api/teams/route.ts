/* eslint-disable no-console */
// api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      select: { id: true, name: true, leaderId: true },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Error fetching teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, leaderId } = await request.json();

    console.log('Received request to create team:', { name, leaderId });

    if (!name) {
      console.log('Team creation failed: Name is required');
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    try {
      const newTeam = await prisma.team.create({
        data: {
          name,
          leaderId: leaderId || undefined,
        },
      });
      console.log('Team created successfully:', newTeam);
      return NextResponse.json(newTeam, { status: 201 });
    } catch (prismaError) {
      console.error('Prisma error during team creation:', prismaError);
      return NextResponse.json({ error: 'Database error during team creation', details: prismaError }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error during team creation:', error);
    return NextResponse.json({ error: 'Unexpected error during team creation', details: error }, { status: 500 });
  }
}