import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Home, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';

const AuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // When component mounts, show a success toast
    toast.success('Authentication successful!', { duration: 5000 });
    
    // Set up countdown timer - wait a bit longer to ensure auth state is propagated
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Start redirect process
          setIsRedirecting(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, []);

  // Use a separate effect to handle the actual navigation
  // This ensures we have the latest auth state when redirecting
  useEffect(() => {
    if (isRedirecting) {
      console.log('AuthSuccessPage: Preparing to redirect with user:', currentUser);
      
      // Add a much longer delay to ensure Firebase Auth state is fully propagated
      // This is especially important for phone authentication
      const redirectTimer = setTimeout(() => {
        // Force a recheck of the current user to ensure we have the latest state
        const user = currentUser;
        console.log('AuthSuccessPage: Final user check before redirect:', user);
        
        // Get appropriate redirect location based on user role
        let destination = '/';
        
        if (user) {
          console.log('AuthSuccessPage: User authenticated, role:', user.role);
          console.log('AuthSuccessPage: User details:', { 
            id: user.id,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            email: user.email
          });
          
          // Check role and redirect accordingly
          if (user.role === 'coach' || 
              user.role === 'league_manager' || 
              user.role === 'admin' || 
              user.role === 'manager' || 
              user.role === 'player' || 
              user.role === 'parent') {
            destination = '/';
            console.log('AuthSuccessPage: User has dashboard access role, redirecting to dashboard');
          } else {
            console.log('AuthSuccessPage: User has regular role, redirecting to homepage');
          }
        } else {
          console.error('AuthSuccessPage: No user data available after waiting, redirecting to homepage');
          // Attempt to manually check auth state from localStorage as a fallback
          try {
            const firebaseUser = auth.currentUser;
            if (firebaseUser) {
              console.log('AuthSuccessPage: Found Firebase auth user but no context user:', firebaseUser.uid);
              destination = '/dashboard';
            }
          } catch (e) {
            console.error('AuthSuccessPage: Error checking Firebase auth:', e);
          }
        }
        
        console.log('AuthSuccessPage: Redirecting to:', destination);
        navigate(destination);
      }, 4000); // Increased to 4000ms for phone auth to properly propagate
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isRedirecting, currentUser, navigate]);
  
  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Successful!
          </h2>
          
          {currentUser ? (
            <p className="mt-2 text-lg text-gray-600">
              {getGreeting()}, {currentUser.displayName || 'User'}!
            </p>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <Loader className="animate-spin h-5 w-5 mr-2 text-brand-primary" />
              <span className="text-gray-600">Finalizing your account...</span>
            </div>
          )}
          
          <div className="mt-8 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                You'll be redirected to the dashboard in {countdown} seconds
              </p>
            ) : (
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <Loader className="animate-spin h-4 w-4 mr-2 text-brand-primary" />
                Redirecting now...
              </p>
            )}
            
            <button
              onClick={() => {
                const destination = currentUser?.role === 'coach' || currentUser?.role === 'league_manager' 
                  ? '/' 
                  : '/';
                navigate(destination);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark"
              disabled={isRedirecting}
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage; 