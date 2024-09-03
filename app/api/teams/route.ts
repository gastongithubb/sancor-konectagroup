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
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Buscar un usuario predeterminado para asignar como líder
    const defaultLeader = await prisma.user.findFirst({
      where: { role: 'leader' },
    });

    if (!defaultLeader) {
      return NextResponse.json({ error: 'No default leader found' }, { status: 400 });
    }

    const newTeam = await prisma.team.create({
      data: {
        name,
        leader: {
          connect: { id: defaultLeader.id },
        },
      },
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Error creating team' }, { status: 500 });
  }
}