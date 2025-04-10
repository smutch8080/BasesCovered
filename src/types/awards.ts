import { AwardCategory } from './index';

export interface TeamAward {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  category: AwardCategory;
  type: string;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AwardFilters {
  category?: AwardCategory | 'all';
  playerId?: string | 'all';
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}