import { Event } from './events';
import { VolunteerSlot } from './volunteer';
import { Position } from './team';

export interface AtBat {
  id: string;
  playerId: string;
  playerName: string;
  inning: number;
  isTopInning: boolean;
  pitcherId: string;
  pitcherName: string;
  balls: number;
  strikes: number;
  fouls: number;
  result: AtBatResult;
  rbi: number;
  errors: number;
  timestamp: Date;
}

export type AtBatResult = 
  | 'single' 
  | 'double' 
  | 'triple' 
  | 'homerun' 
  | 'strikeout' 
  | 'walk' 
  | 'hitByPitch'
  | 'sacrifice' 
  | 'fieldersChoice' 
  | 'error' 
  | 'flyOut' 
  | 'groundOut'
  | 'outAtFirst'
  | 'outAtSecond'
  | 'outAtThird'
  | 'outAtHome'
  | 'foul';

export interface PlayerGameStats {
  playerId: string;
  playerName: string;
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  homeruns: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  errors: number;
  position?: string;
}

export interface InningScore {
  team: number;
  opponent: number;
}

export interface GameState {
  currentInning: number;
  isTopInning: boolean;
  outs: number;
  balls: number;
  strikes: number;
  fouls: number;
  bases: {
    first: string | null; // playerId or null
    second: string | null;
    third: string | null;
  };
  currentBatterId: string | null;
  currentPitcherId: string | null;
}

export interface GameScoreDetails {
  inningScores: InningScore[];
  playerStats: PlayerGameStats[];
  atBats: AtBat[];
  gameState: GameState;
}

export interface Game {
  id: string;
  eventId: string;
  teamId: string;
  teamName: string;
  opponent: string;
  isHomeTeam: boolean;
  startDate: Date;
  endDate: Date;
  location: string;
  score?: {
    team: number;
    opponent: number;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendees: {
    confirmed: string[];
    maybe: string[];
    declined: string[];
  };
  homeLineup?: {
    id: string;
    name: string;
    jerseyNumber: string;
    position: Position;
    order: number;
  }[];
  awayLineup?: {
    id: string;
    name: string;
    jerseyNumber: string;
    position: Position;
    order: number;
  }[];
  volunteerSlots: VolunteerSlot[];
  notes?: string;
  gameState?: GameState;
  createdAt: Date;
  updatedAt: Date;
  scoreDetails?: GameScoreDetails;
  lineup?: {
    team: {
      playerId: string;
      playerName: string;
      position: string;
    }[];
    opponent: {
      playerId: string;
      playerName: string;
      position: string;
    }[];
  };
}