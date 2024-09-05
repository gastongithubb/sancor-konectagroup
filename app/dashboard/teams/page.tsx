'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface Team {
  id: number;
  name: string;
  leader?: { id: number; email: string };
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
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

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create team');
      }
      setNewTeamName('');
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
            <ul className="space-y-2">
              {teams.map((team) => (
                <li key={team.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                  <span>{team.name} {team.leader ? `(Leader: ${team.leader.email})` : '(No leader)'}</span>
                  <Button 
                    onClick={() => handleDeleteTeam(team.id)} 
                    variant="destructive" 
                    size="sm"
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}