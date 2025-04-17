import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'user' | 'coach' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  leagues: string[];
  teams: string[];
  createdAt: string;
}

// For backward compatibility
export type User = AppUser;

export type FirebaseUserWithRole = FirebaseUser & {
  role?: UserRole;
  leagues?: string[];
  teams?: string[];
  createdAt?: string;
}; 