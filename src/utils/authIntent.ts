import { AuthIntent } from '../types/auth';

const AUTH_INTENT_KEY = 'authIntent';
const INTENT_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

export const storeAuthIntent = (intent: Omit<AuthIntent, 'timestamp'>) => {
  localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify({
    ...intent,
    timestamp: Date.now()
  }));
};

export const getStoredAuthIntent = (): AuthIntent | null => {
  try {
    const stored = localStorage.getItem(AUTH_INTENT_KEY);
    if (!stored) return null;

    const intent = JSON.parse(stored) as AuthIntent;
    
    // Clear if older than expiry time
    if (Date.now() - intent.timestamp > INTENT_EXPIRY) {
      localStorage.removeItem(AUTH_INTENT_KEY);
      return null;
    }
    
    return intent;
  } catch (error) {
    console.error('Error getting stored auth intent:', error);
    localStorage.removeItem(AUTH_INTENT_KEY);
    return null;
  }
};

export const clearStoredAuthIntent = () => {
  localStorage.removeItem(AUTH_INTENT_KEY);
};

export const getAuthContextMessage = (mode?: string | null): string => {
  switch (mode) {
    case 'team-invite':
      return 'Sign in or create an account to join the team';
    case 'booking':
      return 'Sign in or create an account to complete your booking';
    case 'clinic-registration':
      return 'Sign in or create an account to register for the clinic';
    default:
      return 'Sign in or create an account to continue';
  }
};

export const getAuthHeaderTitle = (mode?: string | null): string => {
  switch (mode) {
    case 'team-invite':
      return 'Join Your Team';
    case 'booking':
      return 'Complete Your Booking';
    case 'clinic-registration':
      return 'Complete Registration';
    default:
      return 'Welcome Back';
  }
}; 