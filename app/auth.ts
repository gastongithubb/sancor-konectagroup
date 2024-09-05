/* eslint-disable no-console */
import { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

interface ExtendedUser extends User {
  role?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          return null;
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }
        console.log('Authorized user:', { id: user.id.toString(), email: user.email, role: user.role });
        return { id: user.id.toString(), email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: ExtendedUser }) {
      if (user) {
        token.role = user.role;
        token.email = user.email;
        token.id = user.id;
      }
      console.log('JWT callback, token:', JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.id = token.id as string;
      }
      console.log('Session callback, session:', JSON.stringify(session, null, 2));
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
};