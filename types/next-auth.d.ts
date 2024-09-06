// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user?: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    accessToken?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
      accessToken?: string;
    } & DefaultSession["user"]
  }

  interface User {
    role?: string;
    accessToken?: string;
  }
}