export class LeagueError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'LeagueError';
  }
}

export function handleLeagueError(error: any): never {
  console.error('League service error:', error);
  
  if (error instanceof LeagueError) {
    throw error;
  }

  if (error.code === 'permission-denied') {
    throw new LeagueError(
      'You do not have permission to access this league',
      'PERMISSION_DENIED',
      error
    );
  }

  if (error.code === 'not-found') {
    throw new LeagueError(
      'League not found',
      'NOT_FOUND',
      error
    );
  }

  if (error.code === 'failed-precondition') {
    throw new LeagueError(
      'Please ensure you are signed in and have the necessary permissions',
      'FAILED_PRECONDITION',
      error
    );
  }

  throw new LeagueError(
    'An unexpected error occurred while accessing league data',
    'UNKNOWN_ERROR',
    error
  );
}