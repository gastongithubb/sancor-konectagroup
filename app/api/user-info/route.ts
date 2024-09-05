// app/api/user-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: { id: true, email: true, role: true, leadingTeam: { select: { id: true, name: true } } }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({
      sessionUser: user,
      dbUser: dbUser
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}