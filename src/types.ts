// Define enums first
export enum DrillCategory {
  Hitting = 'Hitting',
  Fielding = 'Fielding',
  Bunting = 'Bunting',
  Outfield = 'Outfield',
  Pitching = 'Pitching',
  Catching = 'Catching',
  Agility = 'Agility',
  Speed = 'Speed',
  BaseRunning = 'Base Running',
  TeamBuilding = 'Team Building',
  GameKnowledge = 'Game Knowledge'
}

export enum AwardCategory {
  EffortAndWorkEthic = 'Effort and Work Ethic',
  LeadershipAndTeamwork = 'Leadership and Teamwork',
  FocusAndDiscipline = 'Focus and Discipline',
  SkillAndPerformance = 'Skill and Performance',
  SportsmanshipAndSpirit = 'Sportsmanship and Spirit',
  FunAndCreative = 'Fun and Creative'
}

// Then define interfaces
export interface Drill {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  whatToLookFor: string;
  category: DrillCategory;
  duration: number;
  equipment: string[];
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  votes: number;
  comments: Comment[];
  resources: Resource[];
  videoUrl?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PracticePlan {
  id: string;
  name?: string;
  teamId: string | null;
  teamName: string;
  drills: Drill[];
  duration: number;
  warmup?: {
    enabled: boolean;
    duration: number;
  };
  notes?: string;
  awards?: PracticeAward[];
  date?: Date;
  location?: string;
}

export interface PracticePlanTemplate extends Omit<PracticePlan, 'teamId' | 'teamName'> {
  id: string;
  name: string;
  description: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  categories: DrillCategory[];
  isTemplate: true;
  featured: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedPracticePlan extends PracticePlan {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  featured?: boolean;
  playerId?: string;
  playerName?: string;
}

export interface PracticeAward {
  id: string;
  playerId: string;
  playerName: string;
  category: string;
  type: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Resource {
  type: 'video' | 'document' | 'link';
  title: string;
  url: string;
}