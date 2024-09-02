import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendMessage = (message: any) => {
        const formattedMessage = JSON.stringify(message);
        controller.enqueue(encoder.encode(`data: ${formattedMessage}\n\n`));
      };

      // Simulación de mensajes en tiempo real
      // En una aplicación real, esto se conectaría a una fuente de datos en tiempo real
      let messageCount = 0;
      const interval = setInterval(() => {
        messageCount++;
        sendMessage({
          id: messageCount.toString(),
          content: `Mensaje de prueba ${messageCount}`,
          createdAt: new Date().toISOString(),
        });

        if (messageCount >= 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Asegúrate de limpiar el intervalo si la conexión se cierra
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}