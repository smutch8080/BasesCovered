export class DashboardError extends Error {
  constructor(message: string, public code: string, public originalError?: any) {
    super(message);
    this.name = 'DashboardError';
  }
}

// Improved error handler that returns default values instead of throwing errors
export function handleDashboardError(error: any, defaultValue: any = null) {
  console.error('Dashboard service error:', error);
  
  // Log different error types with different messages for better debugging
  if (error instanceof DashboardError) {
    console.error(`Dashboard error (${error.code}): ${error.message}`);
  } else if (error.code === 'permission-denied') {
    console.error('Permission denied error: The user does not have access to this data');
  } else if (error.code === 'not-found') {
    console.error('Not found error: The requested data could not be found');
  } else if (error.code === 'invalid-argument') {
    console.error('Invalid argument error: The request parameters are invalid');
  } else {
    console.error('Unknown dashboard error:', error);
  }
  
  // Return default value instead of throwing, to prevent UI crashes
  return defaultValue;
}