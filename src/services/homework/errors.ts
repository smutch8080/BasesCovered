export class HomeworkError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'HomeworkError';
  }
}

export function handleHomeworkError(error: any): never {
  console.error('Homework service error:', error);
  
  if (error instanceof HomeworkError) {
    throw error;
  }

  if (error.code === 'permission-denied') {
    throw new HomeworkError(
      'You do not have permission to access this homework',
      'PERMISSION_DENIED',
      error
    );
  }

  if (error.code === 'not-found') {
    throw new HomeworkError(
      'The requested homework was not found',
      'NOT_FOUND',
      error
    );
  }

  throw new HomeworkError(
    'An unexpected error occurred while accessing homework',
    'UNKNOWN_ERROR',
    error
  );
}