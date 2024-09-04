// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Añadimos PrismaClient al tipo global para TypeScript
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

// Guardamos la instancia de prisma globalmente en desarrollo
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;