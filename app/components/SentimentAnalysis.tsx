// app/components/SentimentAnalysis.tsx
'use client';

import { useState, useEffect } from 'react';

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

export default function SentimentAnalysis() {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    const response = await fetch('/api/sentiment');
    const data = await response.json();
    setSentimentData(data);
  };

  if (!sentimentData) return <div>Loading sentiment data...</div>;

  const total = sentimentData.positive + sentimentData.negative + sentimentData.neutral;

  return (
    <div>
      <h2>Case Sentiment Analysis</h2>
      <div>
        <div>Positive: {((sentimentData.positive / total) * 100).toFixed(2)}%</div>
        <div>Negative: {((sentimentData.negative / total) * 100).toFixed(2)}%</div>
        <div>Neutral: {((sentimentData.neutral / total) * 100).toFixed(2)}%</div>
      </div>
    </div>
  );
}
