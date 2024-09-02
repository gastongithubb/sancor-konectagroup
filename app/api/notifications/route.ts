// app/api/notifications/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const pushNotification = (message: string) => {
        const notification = {
          id: Date.now().toString(),
          message,
          createdAt: new Date()
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
      };

      // Simular notificaciones (en una app real, esto se activaría por eventos reales)
      const interval = setInterval(() => {
        pushNotification('New case assigned');
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  });

  return new NextResponse(stream, { headers });
}