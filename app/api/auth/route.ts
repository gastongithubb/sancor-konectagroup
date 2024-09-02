// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Aquí iría la lógica de autenticación
  // Verificar las credenciales contra la base de datos
  // Generar y devolver un token JWT si las credenciales son correctas

  return NextResponse.json({ message: 'Login successful' });
}
