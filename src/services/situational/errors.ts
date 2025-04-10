export class SituationalError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'SituationalError';
  }
}

export function handleSituationalError(error: any): never {
  console.error('Situational awareness service error:', error);
  
  if (error instanceof SituationalError) {
    throw error;
  }

  if (error.code === 'permission-denied') {
    throw new SituationalError(
      'You do not have permission to access this content',
      'PERMISSION_DENIED',
      error
    );
  }

  if (error.code === 'not-found') {
    throw new SituationalError(
      'The requested content was not found',
      'NOT_FOUND',
      error
    );
  }

  if (error.code === 'failed-precondition') {
    throw new SituationalError(
      'Please ensure you are signed in and have the necessary permissions',
      'FAILED_PRECONDITION',
      error
    );
  }

  throw new SituationalError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error
  );
}