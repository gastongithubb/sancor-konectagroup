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

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const newTeam = await prisma.team.create({
      data: {
        name,
        leaderId: leaderId || undefined,
      },
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Error creating team' }, { status: 500 });
  }
}