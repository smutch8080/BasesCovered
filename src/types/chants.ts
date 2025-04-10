export enum ChantCategory {
  PreGame = 'pre_game',
  InGameRally = 'in_game_rally',
  PlayerSpecific = 'player_specific',
  Defensive = 'defensive',
  Offensive = 'offensive',
  Victory = 'victory'
}

export enum ChantDifficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export interface Chant {
  id: string;
  title: string;
  lyrics: string;
  rhythm: string;
  difficulty: ChantDifficulty;
  minPeople: number;
  maxPeople?: number;
  category: ChantCategory;
  gameSituation?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isApproved: boolean;
  featuredUntil?: Date;
  avgRating: number;
  totalRatings: number;
}

export interface ChantRating {
  id: string;
  chantId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChantCollection {
  id: string;
  name: string;
  userId: string;
  chants: Chant[];
  createdAt: Date;
  updatedAt: Date;
}