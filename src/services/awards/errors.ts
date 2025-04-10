export class AwardsError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'AwardsError';
  }
}

export function handleAwardsError(error: any): never {
  console.error('Awards service error:', error);
  
  if (error instanceof AwardsError) {
    throw error;
  }

  if (error.code === 'permission-denied') {
    throw new AwardsError(
      'You do not have permission to access these awards',
      'PERMISSION_DENIED',
      error
    );
  }

  if (error.code === 'not-found') {
    throw new AwardsError(
      'Awards not found',
      'NOT_FOUND',
      error
    );
  }

  if (error.code === 'invalid-argument') {
    throw new AwardsError(
      'Invalid request parameters',
      'INVALID_ARGUMENT',
      error
    );
  }

  throw new AwardsError(
    'An unexpected error occurred while accessing awards',
    'UNKNOWN_ERROR',
    error
  );
}