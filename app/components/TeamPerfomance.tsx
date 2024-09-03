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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const performanceData: { [key: number]: TeamMemberPerformance[] } = {};
        const teamsToFetch = teamId ? [{ id: teamId }] : teams;

        if (!teamsToFetch) {
          throw new Error('No team data provided');
        }

        await Promise.all(
          teamsToFetch.map(async (team) => {
            const response = await fetch(`/api/team-performance?teamId=${team.id}`);
            if (!response.ok) throw new Error(`Failed to fetch data for team ${team.id}`);
            const data = await response.json();
            performanceData[team.id] = data;
          })
        );

        setPerformances(performanceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchPerformances();
  }, [teamId, teams]);

  const renderTeamPerformance = (id: number, name: string) => (
    <div key={id} className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Member</th>
            <th className="p-2 text-left">Cases Handled</th>
            <th className="p-2 text-left">Avg. Resolution Time (hours)</th>
          </tr>
        </thead>
        <tbody>
          {performances[id]?.map((member) => (
            <tr key={member.username} className="border-b">
              <td className="p-2">{member.username}</td>
              <td className="p-2">{member.casesHandled}</td>
              <td className="p-2">{member.averageResolutionTime.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (teamId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Team Performance</h2>
        {renderTeamPerformance(teamId, 'Your Team')}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Team Performances</h2>
      {teams?.map((team) => (
        <div key={team.id} className="mb-6">
          <h3 className="text-lg font-semibold">{team.name}</h3>
          <p>Members: {team._count.members}</p>
          <p>Latest NPS: {team.nps[0]?.score ?? 'N/A'}</p>
          {renderTeamPerformance(team.id, team.name)}
        </div>
      ))}
    </div>
  );
}