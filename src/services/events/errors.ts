export class EventError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'EventError';
  }
}

export function handleEventError(error: any): never {
  console.error('Event service error:', error);
  
  if (error instanceof EventError) {
    throw error;
  }

  if (error.code === 'permission-denied') {
    throw new EventError(
      'You do not have permission to access these events',
      'PERMISSION_DENIED',
      error
    );
  }

  throw new EventError(
    'An unexpected error occurred while accessing events',
    'UNKNOWN_ERROR',
    error
  );
}