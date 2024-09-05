/* eslint-disable no-console */
// api/teams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
    console.error('Error al obtener equipos:', error);
    return NextResponse.json({ error: 'Error al obtener equipos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, leaderId } = await request.json();

    console.log('Solicitud recibida para crear equipo:', { name, leaderId });

    if (!name) {
      console.log('Creación de equipo fallida: El nombre es requerido');
      return NextResponse.json({ error: 'El nombre del equipo es requerido' }, { status: 400 });
    }

    try {
      let leaderIdNumber: number | undefined;
      
      if (leaderId) {
        leaderIdNumber = parseInt(leaderId, 10);
        const leader = await prisma.user.findUnique({
          where: { id: leaderIdNumber },
        });
        if (!leader) {
          return NextResponse.json({ error: 'Líder no encontrado' }, { status: 400 });
        }
      }

      const teamData: Prisma.TeamCreateInput = {
        name,
        ...(leaderIdNumber ? { leader: { connect: { id: leaderIdNumber } } } : {}),
      };

      const newTeam = await prisma.team.create({
        data: teamData,
      });

      console.log('Equipo creado exitosamente:', newTeam);
      return NextResponse.json(newTeam, { status: 201 });
    } catch (prismaError) {
      console.error('Error de Prisma durante la creación del equipo:', prismaError);
      
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        if (prismaError.code === 'P2002') {
          return NextResponse.json({ error: 'Ya existe un equipo con este nombre o el líder ya está asignado a otro equipo' }, { status: 400 });
        } else if (prismaError.code === 'P2003') {
          return NextResponse.json({ error: 'ID de líder inválido' }, { status: 400 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Error de base de datos durante la creación del equipo', 
        details: JSON.stringify(prismaError, Object.getOwnPropertyNames(prismaError))
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error inesperado durante la creación del equipo:', error);
    return NextResponse.json({ 
      error: 'Error inesperado durante la creación del equipo', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}