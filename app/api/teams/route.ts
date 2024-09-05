import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getTeams(req, res);
    case 'POST':
      return createTeam(req, res);
    case 'PUT':
      return updateTeam(req, res);
    case 'DELETE':
      return deleteTeam(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getTeams(req: NextApiRequest, res: NextApiResponse) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching teams' });
  }
}

async function createTeam(req: NextApiRequest, res: NextApiResponse) {
  const { name, leaderId } = req.body;
  try {
    const team = await prisma.team.create({
      data: {
        name,
        leaderId: leaderId || null,
      },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Error creating team' });
  }
}

async function updateTeam(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, leaderId } = req.body;
  try {
    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: {
        name,
        leaderId: leaderId || null,
      },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Error updating team' });
  }
}

async function deleteTeam(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  try {
    await prisma.team.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting team' });
  }
}