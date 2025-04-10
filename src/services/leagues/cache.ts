import { League, LeagueStats } from '../../types/league';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = {
  leagues: new Map<string, CacheEntry<League>>(),
  stats: new Map<string, CacheEntry<LeagueStats>>()
};

export function getCachedLeague(id: string): League | null {
  const entry = cache.leagues.get(id);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.leagues.delete(id);
    return null;
  }

  return entry.data;
}

export function setCachedLeague(id: string, data: League): void {
  cache.leagues.set(id, {
    data,
    timestamp: Date.now()
  });
}

export function getCachedStats(id: string): LeagueStats | null {
  const entry = cache.stats.get(id);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.stats.delete(id);
    return null;
  }

  return entry.data;
}

export function setCachedStats(id: string, data: LeagueStats): void {
  cache.stats.set(id, {
    data,
    timestamp: Date.now()
  });
}

export function clearLeagueCache(): void {
  cache.leagues.clear();
  cache.stats.clear();
}