'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NPSChart = dynamic(() => import('@/components/NpsCharts'), { ssr: false });

interface MemberPerformance {
  name: string;
  casesHandled: number;
  averageResolutionTime: number;
}

interface Team {
  id: number;
  name: string;
  members: {
    email: string;
    assignedCases: {
      createdAt: string;
      updatedAt: string;
    }[];
  }[];
  nps: {
    score: number;
    date: string;
  }[];
}

function TeamPerformance() {
  const [isClient, setIsClient] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [memberPerformance, setMemberPerformance] = useState<MemberPerformance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isClient) {
      if (status === 'unauthenticated' || (session?.user as any)?.role !== 'leader') {
        router.push('/auth/signin');
      } else if (status === 'authenticated') {
        fetchTeamData();
      }
    }
  }, [isClient, status, session, router]);

  const fetchTeamData = async () => {
    try {
      const response = await fetch('/api/team-performance');
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const data: Team = await response.json();
      setTeam(data);
      calculateMemberPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const calculateMemberPerformance = (team: Team) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const performance = team.members.map((member) => {
      const recentCases = member.assignedCases.filter(
        (c) => new Date(c.createdAt) >= thirtyDaysAgo
      );
      const totalResolutionTime = recentCases.reduce(
        (acc, curr) =>
          acc + (new Date(curr.updatedAt).getTime() - new Date(curr.createdAt).getTime()),
        0
      );
      return {
        name: member.email,
        casesHandled: recentCases.length,
        averageResolutionTime:
          recentCases.length > 0
            ? totalResolutionTime / recentCases.length / (1000 * 60 * 60)
            : 0,
      };
    });

    setMemberPerformance(performance);
  };

  if (!isClient || status === 'loading') {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!team) {
    return <div>No team found for this leader</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Team Performance</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team: {team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">NPS Over Time</h3>
          <NPSChart teamId={team.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Performance (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cases Handled</TableHead>
                <TableHead>Avg. Resolution Time (hours)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberPerformance.map((member) => (
                <TableRow key={member.name}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.casesHandled}</TableCell>
                  <TableCell>{member.averageResolutionTime.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default dynamic(() => Promise.resolve(TeamPerformance), { ssr: false });