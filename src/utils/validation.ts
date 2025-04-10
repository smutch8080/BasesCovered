import { UserRole } from '../types/auth';
import { LeagueType } from '../types/league';

export interface RegistrationFormData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  league?: {
    name: string;
    type: LeagueType;
    location: {
      city: string;
      state: string;
      country: string;
    };
    website?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRegistrationForm(data: RegistrationFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Display name validation
  if (data.displayName.trim().length < 2) {
    errors.push({
      field: 'displayName',
      message: 'Display name must be at least 2 characters long'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address'
    });
  }

  // Password validation
  if (data.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters long'
    });
  }

  if (!/[A-Z]/.test(data.password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter'
    });
  }

  if (!/[0-9]/.test(data.password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number'
    });
  }

  // League validation for league managers
  if (data.role === 'league_manager' && data.league) {
    if (!data.league.name.trim()) {
      errors.push({
        field: 'league.name',
        message: 'League name is required'
      });
    }

    if (!data.league.location.city || !data.league.location.state) {
      errors.push({
        field: 'league.location',
        message: 'League location is required'
      });
    }

    if (data.league.website && !/^https?:\/\/.+/.test(data.league.website)) {
      errors.push({
        field: 'league.website',
        message: 'Please enter a valid website URL'
      });
    }

    if (data.league.contactEmail && !emailRegex.test(data.league.contactEmail)) {
      errors.push({
        field: 'league.contactEmail',
        message: 'Please enter a valid contact email'
      });
    }

    if (data.league.contactPhone && !/^\+?[\d\s-()]+$/.test(data.league.contactPhone)) {
      errors.push({
        field: 'league.contactPhone',
        message: 'Please enter a valid phone number'
      });
    }
  }

  return errors;
}