// app/components/NPSChart.tsx
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type NPSData = {
  date: string;
  score: number;
};

export default function NPSChart({ teamId }: { teamId: number }) {
  const [npsData, setNpsData] = useState<NPSData[]>([]);

  useEffect(() => {
    fetch(`/api/nps?teamId=${teamId}`)
      .then(response => response.json())
      .then(data => setNpsData(data));
  }, [teamId]);

  return (
    <div>
      <h2>Team NPS</h2>
      <LineChart width={600} height={300} data={npsData}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}