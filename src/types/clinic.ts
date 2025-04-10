import { User } from './auth';

export interface ClinicPod {
  id: string;
  name: string;
  focusArea: string;
  ageGroup: string;
  skillLevel: string;
  maxSize: number;
  schedule?: {
    startTime: Date;
    endTime: Date;
  }[];
  description?: string;
  coach?: string;
  participants: string[];
}

export interface Clinic {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: {
    address: string;
    placeId: string;
    lat?: number;
    lng?: number;
  };
  ageGroup: string;
  skillLevel: string;
  maxParticipants: number;
  currentParticipants: number;
  fee?: number;
  contactEmail: string;
  contactPhone?: string;
  createdBy: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  pods: ClinicPod[];
  resources: {
    id: string;
    type: 'document' | 'image' | 'video';
    url: string;
    name: string;
    podId?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicRegistration {
  id: string;
  clinicId: string;
  userId: string | null;  // Allow null for non-authenticated users
  userEmail: string | null; // Allow null for non-authenticated users
  userName: string;
  podId?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlisted';
  participantInfo: {
    name: string;
    age: number;
    skillLevel: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    medicalInfo?: string | null;
  };
  paymentStatus?: 'pending' | 'completed' | 'refunded' | null;
  paymentAmount?: number | null;
  paymentDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}