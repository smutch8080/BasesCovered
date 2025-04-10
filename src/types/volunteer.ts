import { User } from './auth';

export interface VolunteerRole {
  id: string;
  name: string;
  description: string;
  requiredSkills?: string[];
  minAge?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerSlot {
  id: string;
  roleId: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  status: 'open' | 'filled' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerHistory {
  id: string;
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  eventId: string;
  eventName: string;
  date: Date;
  hoursServed: number;
  status: 'completed' | 'no_show' | 'cancelled';
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VolunteerStats {
  userId: string;
  totalHours: number;
  eventsVolunteered: number;
  lastVolunteered?: Date;
  roleBreakdown: Record<string, number>;
  updatedAt: Date;
}