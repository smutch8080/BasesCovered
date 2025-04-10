import { CoachProfile } from './coach';

export enum UserRole {
  admin = 'admin',
  league_manager = 'league_manager',
  manager = 'manager',
  coach = 'coach',
  player = 'player',
  parent = 'parent'
}

export interface Badge {
  type: 'lesson';
  lessonId: string;
  lessonTitle: string;
  earnedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  leagues: string[];
  teams: string[];
  badges?: Badge[];
  profilePicture?: string;
  coachProfile?: CoachProfile;
  createdAt?: Date;
  phoneNumber?: string;
}

export interface League {
  id: string;
  name: string;
  description: string;
  managers: string[];
  teams: string[];
}

export interface Team {
  id: string;
  name: string;
  leagueId: string;
  managers: string[];
  coaches: string[];
  players: string[];
  parents: string[];
}