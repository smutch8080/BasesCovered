export interface LeagueSettings {
  allowTeamRegistration: boolean;
  requireApproval: boolean;
  seasonScheduleVisible: boolean;
  standingsVisible: boolean;
  statsVisible: boolean;
}

export interface LeagueResponse {
  success: boolean;
  error?: string;
  data?: any;
}