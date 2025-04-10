export enum CoachingLevel {
  Recreation = 'Recreation',
  Travel = 'Travel',
  HighSchool = 'High School',
  College = 'College',
  Professional = 'Professional'
}

export enum PlayingHistory {
  Recreation = 'Recreation',
  Travel = 'Travel',
  HighSchool = 'High School',
  College = 'College',
  Professional = 'Professional'
}

export interface SocialProfiles {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
}

export interface CoachingService {
  type: 'batting' | 'pitching' | 'catching' | 'fielding' | 'strength';
  price: number;
  duration: number;
  description: string;
  availability: string;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  serviceType?: string;
  verified: boolean;
}

export interface CoachProfile {
  isPublic: boolean;
  bio?: string;
  experience?: string;
  location: {
    city: string;
    state: string;
  };
  lessonLocation: string;
  services: CoachingService[];
  reviews: Review[];
  coachingLevel?: CoachingLevel;
  playingHistory?: PlayingHistory;
  teamsCoached?: string;
  profilePicture?: string;
  socialProfiles: SocialProfiles;
}