// app/components/CaseStatistics.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CaseStatistics({ teamId }: { teamId: number }) {
  const [stats, setStats] = useState({ open: 0, closed: 0, inProgress: 0 });

  useEffect(() => {
    fetch(`/api/cases/stats?teamId=${teamId}`)
      .then((res) => res.json())
      .then(setStats);
  }, [teamId]);

  return (
    <div>
      <h3>Case Statistics</h3>
      <p>Open: {stats.open}</p>
      <p>In Progress: {stats.inProgress}</p>
      <p>Closed: {stats.closed}</p>
    </div>
  );
}
