import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/auth';
import GlobalStatistics from '@/app/components/GlobalStatics';
import TeamPerformance from '@/app/components/TeamPerfomance';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';

interface ExtendedUser {
  role?: string;
}

interface DashboardLinkProps {
  href: string;
  children: React.ReactNode;
}

const DashboardLink: React.FC<DashboardLinkProps> = ({ href, children }) => (
  <Button variant="outline" asChild className="mr-2">
    <Link href={href}>{children}</Link>
  </Button>
);

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as ExtendedUser).role !== 'manager') {
    redirect('/auth/signin');
  }

  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { members: true },
        },
        nps: {
          take: 1,
          orderBy: { date: 'desc' },
        },
      },
    });

    return (
      <div className="container mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Manager Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <DashboardLink href="/dashboard/teams">Equipos</DashboardLink>
              <DashboardLink href="/auth/register">Register New User</DashboardLink>
              <DashboardLink href="/dashboard/leader">Lider Dashboard</DashboardLink>
              <DashboardLink href="/dashboard/agent">Agentes Dashboard</DashboardLink>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Global Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <GlobalStatistics />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamPerformance teams={teams} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Error loading dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  } finally {
    await prisma.$disconnect();
  }
}