import { Homework } from '../../types/homework';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateHomework(homework: Partial<Homework>): ValidationResult {
  const errors: string[] = [];

  if (!homework.title?.trim()) {
    errors.push('Title is required');
  }

  if (!homework.teamId) {
    errors.push('Team ID is required');
  }

  if (!homework.dueDate) {
    errors.push('Due date is required');
  } else if (homework.dueDate < new Date()) {
    errors.push('Due date cannot be in the past');
  }

  if (homework.drills?.length === 0) {
    errors.push('At least one drill must be assigned');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}