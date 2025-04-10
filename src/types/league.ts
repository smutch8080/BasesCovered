export enum LeagueType {
  Recreation = 'Recreation',
  Travel = 'Travel',
  School = 'School',
  Tournament = 'Tournament',
  AllStar = 'All Star'
}

export interface League {
  id: string;
  name: string;
  type: LeagueType;
  description?: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  managers: string[];
  teams: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueStats {
  totalTeams: number;
  totalPlayers: number;
  activeSeasons: number;
  upcomingEvents: number;
}