import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { name, leaderId } = await request.json();
  try {
    const team = await prisma.team.create({
      data: {
        name,
        leaderId: leaderId || null,
      },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating team' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { id, name, leaderId } = await request.json();
  try {
    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        name,
        leaderId: leaderId || null,
      },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating team' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  try {
    await prisma.team.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting team' }, { status: 500 });
  }
}