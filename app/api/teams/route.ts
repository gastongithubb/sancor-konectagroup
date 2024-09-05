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

    // Verificar si ya existe un equipo con el mismo nombre
    const existingTeam = await prisma.team.findFirst({
      where: { name: name },
    });

    if (existingTeam) {
      return NextResponse.json({ error: 'Ya existe un equipo con este nombre' }, { status: 400 });
    }

    try {
      const teamData: Prisma.TeamCreateInput = { name };
      
      if (leaderId) {
        const leaderIdNumber = parseInt(leaderId, 10);
        const leader = await prisma.user.findUnique({
          where: { id: leaderIdNumber },
        });
        if (!leader) {
          return NextResponse.json({ error: 'Líder no encontrado' }, { status: 400 });
        }
        teamData.leader = { connect: { id: leaderIdNumber } };
      }

      console.log('Intentando crear equipo con datos:', teamData);

      const newTeam = await prisma.team.create({
        data: teamData,
        include: { leader: true }, // Incluir información del líder en la respuesta
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
        } else if (prismaError.code === 'P2011') {
          return NextResponse.json({ error: 'El líder es requerido para crear un equipo. Verifica tu esquema de base de datos.' }, { status: 400 });
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

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Se requiere el ID del equipo' }, { status: 400 });
    }

    const deletedTeam = await prisma.team.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: 'Equipo eliminado exitosamente', team: deletedTeam });
  } catch (error) {
    console.error('Error al eliminar el equipo:', error);
    return NextResponse.json({ error: 'Error al eliminar el equipo' }, { status: 500 });
  }
}