// app/components/GlobalStatistics.tsx
'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalCases: number;
  openCases: number;
  averageNPS: number | null;
}

export default function GlobalStatistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/statistics/global')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch statistics');
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return <div>Loading statistics...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Global Statistics</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-600">Total Cases</p>
          <p className="text-2xl font-bold">{stats.totalCases}</p>
        </div>
        <div>
          <p className="text-gray-600">Open Cases</p>
          <p className="text-2xl font-bold">{stats.openCases}</p>
        </div>
        <div>
          <p className="text-gray-600">Average NPS</p>
          <p className="text-2xl font-bold">
            {stats.averageNPS != null ? stats.averageNPS.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}