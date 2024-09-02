// app/components/GlobalStatistics.tsx
'use client'

import { useState, useEffect } from 'react';

export default function GlobalStatistics() {
  const [stats, setStats] = useState({ totalCases: 0, openCases: 0, averageNPS: 0 });

  useEffect(() => {
    fetch('/api/statistics/global')
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <h2>Global Statistics</h2>
      <p>Total Cases: {stats.totalCases}</p>
      <p>Open Cases: {stats.openCases}</p>
      <p>Average NPS: {stats.averageNPS.toFixed(2)}</p>
    </div>
  );
}