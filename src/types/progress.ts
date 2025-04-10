export interface SkillRating {
  value: number | null;  // null means N/A
  notApplicable: boolean;
}

export interface ProgressReport {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  date: Date;
  skills: {
    hitting: SkillRating;
    catching: SkillRating;
    fielding: SkillRating;
    popFlies: SkillRating;
    bunting: SkillRating;
    groundBalls: SkillRating;
    gameAwareness: SkillRating;
    baseRunning: SkillRating;
    attitude: SkillRating;
  };
  pros: string;
  cons: string;
  areasForFocus: string;
  goals: string;
  practicePlans: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}