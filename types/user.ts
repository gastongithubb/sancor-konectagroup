// types/user.ts
export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  teamId?: number;
}
