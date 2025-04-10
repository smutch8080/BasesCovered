import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Trophy, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PhoneAuthForm } from '../components/auth/PhoneAuthForm';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

// Storage key for invite details - same as in TeamInvitePage
const INVITE_STORAGE_KEY = 'pendingTeamInvite';

// Helper functions for invite storage
const getStoredInvite = () => {
  try {
    const stored = localStorage.getItem(INVITE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error getting stored invite:', error);
  }
  return null;
};

const clearStoredInvite = () => {
  try {
    localStorage.removeItem(INVITE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing invite from storage:', error);
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, signInWithApple, currentUser } = useAuth();
  
  // Log whenever the component renders
  console.log('LoginPage rendered', { currentUser: currentUser?.id, path: location.pathname });
  
  // This effect monitors authentication state and redirects authenticated users
  useEffect(() => {
    console.log('LoginPage: Auth state changed', { 
      authenticated: !!currentUser,
      userId: currentUser?.id, 
      displayName: currentUser?.displayName,
    });
    
    if (currentUser) {
      console.log('User is authenticated, redirecting to return URL or home');
      // Add a small delay to ensure the auth state is fully processed
      const timer = setTimeout(() => {
        console.log('Executing redirect');
        
        // Get proper return URL
        const returnUrl = getReturnUrl();
        console.log('Redirecting to:', returnUrl);
        
        navigate(returnUrl);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);

  // Get returnUrl from location state, stored invite, or default to "/auth-success"
  const getReturnUrl = () => {
    // First check location state for returnUrl
    const returnUrl = location.state?.returnUrl;
    if (returnUrl) {
      console.log('Using returnUrl from location state:', returnUrl);
      return returnUrl;
    }
    
    // Then check for stored invite
    const storedInvite = getStoredInvite();
    if (storedInvite) {
      console.log('Found stored invite:', storedInvite);
      // Clear the invite since we're handling it now
      clearStoredInvite();
      // Return the join URL for this team
      return `/teams/${storedInvite.teamId}/join`;
    }
    
    // Default to auth success page instead of home
    console.log('No specific return URL, using auth-success page');
    return '/auth-success';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Starting email/password sign in');
      await signIn(email, password);
      console.log('Email/password sign-in completed, waiting for auth state to update');
      // Do not navigate here - let the useEffect handle it
    } catch (error) {
      console.error('Failed to sign in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      console.log('Starting Google sign in from LoginPage');
      await signInWithGoogle();
      
      // After signing in, get the return URL and navigate
      // The navigation here should happen after the auth state change is detected
      // in the AuthContext, which will update the currentUser
      console.log('Google sign-in completed, waiting for auth state to update');
      // Do not navigate immediately - the useEffect in the LoginPage will handle this
    } catch (error: any) {
      console.error('Failed to sign in with Google:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to sign in with Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      console.log('Starting Apple sign in from LoginPage');
      await signInWithApple();
      console.log('Apple sign-in completed, waiting for auth state to update');
      // Do not navigate here - let the useEffect handle it
    } catch (error: any) {
      console.error('Failed to sign in with Apple:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to sign in with Apple');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handlePhoneAuthSuccess = () => {
    // The PhoneAuthForm component handles navigation directly,
    // so we just log success here and don't do any additional navigation
    console.log('Phone authentication successful in LoginPage');
    console.log('Navigation handled by PhoneAuthForm component');
    // Let the PhoneAuthForm handle the navigation - don't navigate here
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="min-h-screen flex">
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1524094676921-20ba48ee07c0"
            alt="Softball player"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8 pb-20 lg:pb-0">
            <div className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-brand-primary" />
              <h2 className="mt-6 text-3xl font-bold text-brand-dark">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-brand-muted">
                Sign in to continue to your account
              </p>
            </div>

            {showPhoneAuth ? (
              <div className="space-y-6">
                <PhoneAuthForm 
                  mode="signin" 
                  onSuccess={handlePhoneAuthSuccess} 
                />
                <button
                  type="button"
                  onClick={() => setShowPhoneAuth(false)}
                  className="mt-2 w-full text-center text-sm text-brand-primary hover:text-brand-primary-dark"
                >
                  Back to login options
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 input"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-muted">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link to="/forgot-password" className="link">
                        Forgot your password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 btn-primary w-full flex justify-center"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Sign in with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/phone-auth-test')}
                    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    <Phone className="h-5 w-5" />
                    Sign in with Phone
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-sm text-brand-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="link">
                      Sign up
                    </Link>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}