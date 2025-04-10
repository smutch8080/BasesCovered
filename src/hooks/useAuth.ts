import { useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';

interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          currentUser: user,
          loading: false,
          error: null
        });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthState({
          currentUser: null,
          loading: false,
          error: error.message
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to sign in' 
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with display name
      await updateProfile(user, { displayName });
      
      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to sign up' 
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const auth = getAuth();
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to sign out' 
      }));
      throw error;
    }
  };

  return {
    currentUser: authState.currentUser,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut
  };
} 