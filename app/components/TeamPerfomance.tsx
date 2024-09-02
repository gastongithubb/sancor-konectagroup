// app/components/TeamPerformance.tsx
'use client'

import { useState, useEffect } from 'react';

interface TeamMemberPerformance {
  username: string;
  casesHandled: number;
  averageResolutionTime: number;
}

export default function TeamPerformance({ teamId }: { teamId: number }) {
  const [performance, setPerformance] = useState<TeamMemberPerformance[]>([]);

  useEffect(() => {
    fetch(`/api/team-performance?teamId=${teamId}`)
      .then(res => res.json())
      .then(setPerformance);
  }, [teamId]);

  return (
    <div>
      <h3>Team Performance</h3>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Cases Handled</th>
            <th>Avg. Resolution Time (hours)</th>
          </tr>
        </thead>
        <tbody>
          {performance.map(member => (
            <tr key={member.username}>
              <td>{member.username}</td>
              <td>{member.casesHandled}</td>
              <td>{member.averageResolutionTime.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}