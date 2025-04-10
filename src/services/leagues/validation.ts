import { League } from '../../types/league';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateLeague(league: Partial<League>): ValidationResult {
  const errors: string[] = [];

  if (!league.name?.trim()) {
    errors.push('League name is required');
  }

  if (!league.location?.city || !league.location?.state) {
    errors.push('League location is required');
  }

  if (league.website && !/^https?:\/\/.+/.test(league.website)) {
    errors.push('Please enter a valid website URL');
  }

  if (league.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(league.contactEmail)) {
    errors.push('Please enter a valid contact email');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}