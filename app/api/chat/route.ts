// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { content, senderId } = await request.json();

  try {
    const newMessage = await prisma.chatMessage.create({
      data: {
        content,
        senderId,
      },
    });
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating message' }, { status: 500 });
  }
}
