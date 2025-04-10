import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { RegistrationForm } from '../components/auth/RegistrationForm';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sendSignupConfirmation } from '../services/notifications/events';
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

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, currentUser } = useAuth();
  
  // Log whenever the component renders
  console.log('RegisterPage rendered', { currentUser: currentUser?.id, path: location.pathname });
  
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
  
  // This effect is crucial - it monitors authentication state
  // and redirects authenticated users to home
  useEffect(() => {
    console.log('RegisterPage: Auth state changed', { 
      authenticated: !!currentUser,
      userId: currentUser?.id, 
      displayName: currentUser?.displayName,
      role: currentUser?.role,
      phoneNumber: currentUser?.phoneNumber 
    });
    
    if (currentUser) {
      console.log('User is authenticated, redirecting to return URL or home');
      // Add a small delay to ensure the auth state is fully processed
      const timer = setTimeout(() => {
        console.log('Executing redirect');
        toast.success('You are now signed in!');
        
        // Get proper return URL
        const returnUrl = getReturnUrl();
        console.log('Redirecting to:', returnUrl);
        
        navigate(returnUrl);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate, location.state]);

  const handleSubmit = async (data: { 
    email: string; 
    password: string; 
    displayName: string; 
    role: UserRole;
    league?: any;
  }) => {
    try {
      setLoading(true);
      console.log('Starting registration process:', {
        email: data.email,
        role: data.role,
        isLeagueManager: data.role === 'league_manager',
        hasLeagueData: !!data.league
      });

      // Create user account first
      const user = await signUp(data.email, data.password, data.displayName, data.role);
      
      // If league manager, create league
      if (data.role === 'league_manager' && data.league) {
        console.log('Creating league for new league manager');
        
        const leagueData = {
          name: data.league.name.trim(),
          type: data.league.type,
          location: {
            city: data.league.location.city,
            state: data.league.location.state,
            country: data.league.location.country || 'USA',
            placeId: data.league.location.placeId
          },
          website: data.league.website?.trim() || null,
          contactName: data.league.contactName?.trim() || null,
          contactEmail: data.league.contactEmail?.trim() || null,
          contactPhone: data.league.contactPhone?.trim() || null,
          managers: [user.id],
          teams: [],
          createdBy: user.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const leagueRef = await addDoc(collection(db, 'leagues'), leagueData);
        console.log('League created successfully:', leagueRef.id);
      }
      
      // Send signup confirmation notification
      await sendSignupConfirmation(data.email, data.email, data.displayName);
      
      toast.success('Account created successfully!');
      
      // Use getReturnUrl to determine where to navigate
      const returnUrl = getReturnUrl();
      console.log('Redirecting to:', returnUrl);
      navigate(returnUrl);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="bg-gray-50">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1524094676921-20ba48ee07c0"
          alt="Softball player"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-brand-primary" />
            <h2 className="mt-6 text-3xl font-bold text-brand-dark">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-brand-muted">
              Join our community of coaches and players
            </p>
          </div>

          <RegistrationForm onSubmit={handleSubmit} loading={loading} />

          <div className="text-center">
            <span className="text-sm text-brand-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-primary hover:opacity-90">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}