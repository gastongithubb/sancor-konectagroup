// app/api/chat/stream/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const headers = new Headers();
  headers.append('Content-Type', 'text/event-stream');
  headers.append('Cache-Control', 'no-cache');
  headers.append('Connection', 'keep-alive');

  const stream = new ReadableStream({
    async start(controller) {
      const sendMessage = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
      };

      // Set up a real-time listener for new messages
      // This is a simplified example. In a real app, you'd use a proper pub/sub system.
      setInterval(async () => {
        const latestMessage = await prisma.chatMessage.findFirst({
          orderBy: { createdAt: 'desc' },
        });
        if (latestMessage) {
          sendMessage(latestMessage);
        }
      }, 1000);
    },
  });

  return new NextResponse(stream, { headers });
}