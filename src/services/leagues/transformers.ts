import { League, LeagueStats } from '../../types/league';

export function transformLeague(id: string, data: any): League {
  return {
    ...data,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as League;
}

export function transformLeagueStats(data: any): LeagueStats {
  return {
    totalTeams: data.totalTeams || 0,
    totalPlayers: data.totalPlayers || 0,
    activeSeasons: data.activeSeasons || 0,
    upcomingEvents: data.upcomingEvents || 0
  };
}