import { Homework } from '../../types/homework';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: Homework[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedHomework(key: string): Homework[] | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedHomework(key: string, data: Homework[]): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearHomeworkCache(): void {
  cache.clear();
}