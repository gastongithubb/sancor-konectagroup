// app/dashboard/teams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Team {
  id: number;
  name: string;
  leaderId: number;
}

interface User {
  id: number;
  username: string;
  role: string;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    const response = await fetch('/api/teams');
    const data = await response.json();
    setTeams(data);
  };

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTeamName, leaderId: parseInt(selectedLeader) }),
    });

    if (response.ok) {
      setNewTeamName('');
      setSelectedLeader('');
      fetchTeams();
    } else {
      console.error('Error creating team');
    }
  };

  return (
    <div>
      <h1>Team Management</h1>
      <form onSubmit={handleCreateTeam}>
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New Team Name"
          required
        />
        <select value={selectedLeader} onChange={(e) => setSelectedLeader(e.target.value)} required>
          <option value="">Select Team Leader</option>
          {users
            .filter((user) => user.role === 'leader')
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
        </select>
        <button type="submit">Create Team</button>
      </form>
      <h2>Existing Teams</h2>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </div>
  );
}
