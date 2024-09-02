// app/components/TeamPerformance.tsx
'use client';

import { useState, useEffect } from 'react';

interface TeamMemberPerformance {
  username: string;
  casesHandled: number;
  averageResolutionTime: number;
}

interface Team {
  id: number;
  name: string;
  _count: { members: number };
  nps: { score: number }[];
}

interface TeamPerformanceProps {
  teamId?: number;
  teams?: Team[];
}

export default function TeamPerformance({ teamId, teams }: TeamPerformanceProps) {
  const [performances, setPerformances] = useState<{ [key: number]: TeamMemberPerformance[] }>({});

  useEffect(() => {
    const fetchPerformances = async () => {
      const performanceData: { [key: number]: TeamMemberPerformance[] } = {};
      if (teamId) {
        const response = await fetch(`/api/team-performance?teamId=${teamId}`);
        const data = await response.json();
        performanceData[teamId] = data;
      } else if (teams) {
        for (const team of teams) {
          const response = await fetch(`/api/team-performance?teamId=${team.id}`);
          const data = await response.json();
          performanceData[team.id] = data;
        }
      }
      setPerformances(performanceData);
    };

    fetchPerformances();
  }, [teamId, teams]);

  const renderTeamPerformance = (id: number, name: string) => (
    <div key={id}>
      <h3>{name}</h3>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Cases Handled</th>
            <th>Avg. Resolution Time (hours)</th>
          </tr>
        </thead>
        <tbody>
          {performances[id]?.map((member) => (
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

  if (teamId) {
    return (
      <div>
        <h2>Team Performance</h2>
        {renderTeamPerformance(teamId, 'Your Team')}
      </div>
    );
  }

  return (
    <div>
      <h2>Team Performances</h2>
      {teams?.map((team) => (
        <div key={team.id}>
          <h3>{team.name}</h3>
          <p>Members: {team._count.members}</p>
          <p>Latest NPS: {team.nps[0]?.score ?? 'N/A'}</p>
          {renderTeamPerformance(team.id, team.name)}
        </div>
      ))}
    </div>
  );
}
