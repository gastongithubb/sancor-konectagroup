import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Cliente Prisma singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Esquemas de validación de entrada
const crearEquipoSchema = z.object({
  nombre: z.string().min(1),
  idLider: z.number().optional(),
});

const actualizarEquipoSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1).optional(),
  idLider: z.number().nullable().optional(),
});

// Manejador de errores
const manejarError = (error: unknown) => {
  console.error('Error:', error);
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Datos de entrada no válidos' }, { status: 400 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ error: 'Ocurrió un error desconocido' }, { status: 500 });
};

// Middleware de autenticación
const autenticar = async (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No autorizado: Encabezado de autorización no proporcionado');
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new Error('No autorizado: Formato de token inválido');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Error de configuración del servidor: JWT_SECRET no está definido');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string, email: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('No autorizado: Token JWT inválido');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('No autorizado: Token JWT expirado');
    }
    throw new Error('No autorizado: Error en la verificación del token');
  }
};

export async function GET(request: NextRequest) {
  try {
    await autenticar(request);
    const equipos = await prisma.team.findMany({
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(equipos);
  } catch (error) {
    return manejarError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await autenticar(request);
    const datos = await request.json();
    const { nombre, idLider } = crearEquipoSchema.parse(datos);
    const equipo = await prisma.team.create({
      data: { name: nombre, leaderId: idLider || null },
      include: { leader: { select: { id: true, email: true } } },
    });
    return NextResponse.json(equipo, { status: 201 });
  } catch (error) {
    return manejarError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await autenticar(request);
    const datos = await request.json();
    const { id, nombre, idLider } = actualizarEquipoSchema.parse(datos);
    const equipo = await prisma.team.update({
      where: { id },
      data: { name: nombre, leaderId: idLider ?? undefined },
      include: { leader: { select: { id: true, email: true } } },
    });
    return NextResponse.json(equipo);
  } catch (error) {
    return manejarError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await autenticar(request);
    const { id } = await request.json();
    await prisma.team.delete({ where: { id: Number(id) } });
    return NextResponse.json({ mensaje: 'Equipo eliminado con éxito' });
  } catch (error) {
    return manejarError(error);
  }
}