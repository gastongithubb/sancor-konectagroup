// app/components/CaseDistribution.tsx
'use client'

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CaseDistribution {
  status: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function CaseDistribution({ teamId }: { teamId: number }) {
  const [distribution, setDistribution] = useState<CaseDistribution[]>([]);

  useEffect(() => {
    fetch(`/api/case-distribution?teamId=${teamId}`)
      .then(res => res.json())
      .then(setDistribution);
  }, [teamId]);

  return (
    <div>
      <h3>Case Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={distribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul>
        {distribution.map((entry, index) => (
          <li key={entry.status} style={{color: COLORS[index % COLORS.length]}}>
            {entry.status}: {entry.count}
          </li>
        ))}
      </ul>
    </div>
  );
}