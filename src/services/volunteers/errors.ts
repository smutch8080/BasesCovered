export class VolunteerError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'VolunteerError';
  }
}

export function handleVolunteerError(error: any): never {
  console.error('Volunteer service error:', error);
  
  if (error instanceof VolunteerError) {
    throw error;
  }

  if (error.code === 'permission-denied') {
    throw new VolunteerError(
      'You do not have permission to access this volunteer information',
      'PERMISSION_DENIED',
      error
    );
  }

  if (error.code === 'invalid-argument') {
    let message = 'Invalid data provided';
    if (error.message) {
      message = error.message;
    }
    throw new VolunteerError(message, 'INVALID_DATA', error);
  }

  if (error.code === 'failed-precondition') {
    throw new VolunteerError(
      'Please ensure you are signed in and have the necessary permissions',
      'FAILED_PRECONDITION',
      error
    );
  }

  if (error.code === 'not-found') {
    throw new VolunteerError(
      'The requested volunteer information was not found',
      'NOT_FOUND',
      error
    );
  }

  // Handle validation errors
  if (error instanceof Error && error.message) {
    throw new VolunteerError(
      error.message,
      'VALIDATION_ERROR',
      error
    );
  }

  throw new VolunteerError(
    'An unexpected error occurred while accessing volunteer information',
    'UNKNOWN_ERROR',
    error
  );
}