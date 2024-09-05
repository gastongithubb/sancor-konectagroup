'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: number;
  email: string;
}

interface Team {
  id: number;
  name: string;
  leader?: User;
}

const NO_LEADER = 'no-leader';

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedLeader, setSelectedLeader] = useState<string>(NO_LEADER);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while fetching teams');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while fetching users');
      }
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newTeamName, 
          leaderId: selectedLeader !== NO_LEADER ? parseInt(selectedLeader) : null 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }
      setNewTeamName('');
      setSelectedLeader(NO_LEADER);
      await fetchTeams();
      setSuccess('Team created successfully');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeamLeader = async (teamId: number, leaderId: string) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: teamId, 
          leaderId: leaderId !== NO_LEADER ? parseInt(leaderId) : null 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team leader');
      }
      await fetchTeams();
      setSuccess('Team leader updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while updating the team leader');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teamId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }
      await fetchTeams();
      setSuccess('Team deleted successfully');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while deleting the team');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Management</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <Input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="New Team Name"
              required
              disabled={isLoading}
            />
            <Select value={selectedLeader} onValueChange={setSelectedLeader}>
              <SelectTrigger>
                <SelectValue placeholder="Select a leader (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LEADER}>No leader</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Teams</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading teams...</p>
          ) : teams.length === 0 ? (
            <p>No teams found.</p>
          ) : (
            <ul className="space-y-4">
              {teams.map((team) => (
                <li key={team.id} className="bg-gray-100 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{team.name}</span>
                    <Button 
                      onClick={() => handleDeleteTeam(team.id)} 
                      variant="destructive" 
                      size="sm"
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={team.leader?.id.toString() || NO_LEADER} 
                      onValueChange={(value) => handleUpdateTeamLeader(team.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leader" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_LEADER}>No leader</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>{team.leader ? `Current leader: ${team.leader.email}` : 'No leader assigned'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}