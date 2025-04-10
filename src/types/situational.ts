export interface PositionKeyframe {
  x: number;
  y: number;
  timestamp: number;
}

export interface PositionAnimation {
  positionId: number;
  keyframes: PositionKeyframe[];
}

export interface ScenarioAnimation {
  duration: number;
  animations: PositionAnimation[];
}

export interface Position {
  x: number;
  y: number;
  type: 'player' | 'ball' | 'runner' | 'batter';
  label?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
  animation?: ScenarioAnimation;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  positions: Position[];
  questions: Question[];
  createdBy: string;
  teamId?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioAttempt {
  id: string;
  scenarioId: string;
  userId: string;
  teamId?: string;
  score: number;
  answers: {
    questionId: string;
    selectedOption: number;
    correct: boolean;
    timeSpent: number;
  }[];
  totalTime: number;
  completedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  teamId?: string;
  score: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
  lastPlayed: Date;
}