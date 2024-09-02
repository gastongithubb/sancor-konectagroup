// app/api/sentiment/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // This is a mock implementation. In a real app, you'd use a proper sentiment analysis service.
    const cases = await prisma.case.findMany();
    const sentiments = cases.map(() => {
      const random = Math.random();
      if (random < 0.33) return 'positive';
      if (random < 0.66) return 'negative';
      return 'neutral';
    });

    const sentimentCounts = sentiments.reduce(
      (acc, sentiment) => {
        acc[sentiment]++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    return NextResponse.json(sentimentCounts);
  } catch (error) {
    return NextResponse.json({ error: 'Error analyzing sentiments' }, { status: 500 });
  }
}
