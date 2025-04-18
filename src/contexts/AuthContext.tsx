import React, { useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  getAuth,
  updateProfile,
  signInWithCredential,
  PhoneAuthCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '../lib/firebase';
import { User, UserRole } from '../types/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: (role: UserRole) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUpWithApple: (role: UserRole) => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: any) => Promise<ConfirmationResult>;
  verifyPhoneCode: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  signUpWithPhone: (phoneNumber: string, recaptchaVerifier: any, role: UserRole, displayName: string) => Promise<ConfirmationResult>;
  verifyPhoneCodeForSignUp: (confirmationResult: ConfirmationResult, code: string, role: UserRole, displayName: string) => Promise<User>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
  isInLeague: (leagueId: string) => boolean;
  isInTeam: (teamId: string) => boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

// Get stored invite details
const getStoredInvite = () => {
  const stored = localStorage.getItem('pendingTeamInvite');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored invite:', error);
      localStorage.removeItem('pendingTeamInvite');
    }
  }
  return null;
};

// Clear stored invite
const clearStoredInvite = () => {
  localStorage.removeItem('pendingTeamInvite');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Handle redirect result on mount
  React.useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('AuthProvider: Checking for redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result) {
          console.log('AuthProvider: Got redirect result, user:', result.user.email);
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Combine Firebase user with Firestore data
          const fullUser: User = {
            id: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || userData.displayName || '',
            role: userData.role || 'user',
            leagues: userData.leagues || [],
            teams: userData.teams || [],
            badges: userData.badges || []
          };
          
          setCurrentUser(fullUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error handling redirect:', error);
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Auth state change listener
  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthProvider: Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Map Firebase user to our User type
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || userData.displayName || '',
            role: userData.role || 'user',
            leagues: userData.leagues || [],
            teams: userData.teams || [],
            badges: userData.badges || []
          };
          
          setCurrentUser(user);
        } catch (error) {
          console.error('Error getting user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ 
          id: user.uid,
          ...userData,
          teams: userData.teams || [],
          leagues: userData.leagues || [],
          badges: userData.badges || []
        } as User);
        toast.success('Signed in successfully');
      } else {
        toast.error('User profile not found');
        await firebaseSignOut(auth);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        toast.error('Failed to sign in');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole): Promise<User> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const userData: User = {
        id: user.uid,
        email: email.toLowerCase(),
        displayName,
        role,
        leagues: [],
        teams: [],
        badges: []
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setCurrentUser(userData);
      return userData;
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error('Failed to create account');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Initiating Google sign in...');
      
      // Configure Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use redirect instead of popup for better reliability
      await signInWithRedirect(auth, googleProvider);
      
      // The redirect will happen here, and the result will be handled
      // by the useEffect hook above when the page reloads
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setLoading(false);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  const signUpWithGoogle = async (role: UserRole) => {
    try {
      // Configure Google provider with login_hint to improve user experience
      googleProvider.setCustomParameters({
        prompt: 'select_account',
        login_hint: ''
      });
      
      console.log('Initiating Google sign up for role:', role);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User already exists, just sign them in
        const userData = userDoc.data();
        setCurrentUser({ 
          id: user.uid,
          ...userData,
          teams: userData.teams || [],
          leagues: userData.leagues || [],
          badges: userData.badges || []
        } as User);
        toast.success('Welcome back! You already have an account');
        
        // Check for pending team invite - but DO NOT clear it here
        const pendingInvite = getStoredInvite();
        if (pendingInvite) {
          console.log('Found pending invite after existing Google user sign up:', pendingInvite);
          // DO NOT clear the invite - let the RegisterPage handle the redirect
        }
      } else {
        // Create a new user profile
        const userData: User = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Google User',
          role,
          leagues: [],
          teams: [],
          badges: [],
          profilePicture: user.photoURL || undefined,
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        setCurrentUser(userData);
        toast.success('Account created successfully with Google');
        
        // Check for pending team invite - but DO NOT clear it here
        const pendingInvite = getStoredInvite();
        if (pendingInvite) {
          console.log('Found pending invite after new Google user sign up:', pendingInvite);
          // DO NOT clear the invite - let the RegisterPage handle the redirect
        }
      }
    } catch (error: any) {
      console.error('Google sign up error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, this is not an error that should be shown to the user
        console.log('User cancelled sign up by closing the popup');
        // Don't show any toast for this case - it's not an error to the user
        return; // Return without throwing so it doesn't bubble up as an error
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Another silent case, don't show error
        console.log('Popup request was cancelled');
        return;
      } else if (error.code === 'auth/internal-error') {
        toast.error('An error occurred. Please try again or use email signup instead.');
      } else {
        toast.error('Failed to sign up with Google');
      }
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      // Check if this Apple user exists in our users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User exists, set current user from Firestore data
        const userData = userDoc.data();
        setCurrentUser({ 
          id: user.uid,
          ...userData,
          teams: userData.teams || [],
          leagues: userData.leagues || [],
          badges: userData.badges || []
        } as User);
        toast.success('Signed in successfully with Apple');
      } else {
        // User signed in with Apple but doesn't have a profile
        // They need to complete registration with role selection
        await firebaseSignOut(auth);
        toast.error('Please sign up with Apple first to create your profile');
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
        console.log('User cancelled sign in by closing the popup');
        return;
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        return;
      } else if (error.code === 'auth/internal-error') {
        toast.error('An error occurred. Please try again or use email login instead.');
      } else {
        toast.error('Failed to sign in with Apple');
      }
      throw error;
    }
  };

  const signUpWithApple = async (role: UserRole) => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User already exists, just sign them in
        const userData = userDoc.data();
        setCurrentUser({ 
          id: user.uid,
          ...userData,
          teams: userData.teams || [],
          leagues: userData.leagues || [],
          badges: userData.badges || []
        } as User);
        toast.success('Welcome back! You already have an account');
      } else {
        // Create a new user profile
        // Note: Apple may not provide displayName on first sign in
        // We'll use email or a generic name if not available
        let displayName = user.displayName;
        if (!displayName) {
          // Extract name from email or use generic name
          displayName = user.email ? user.email.split('@')[0] : 'Apple User';
        }
        
        const userData: User = {
          id: user.uid,
          email: user.email || '',
          displayName,
          role,
          leagues: [],
          teams: [],
          badges: [],
          profilePicture: user.photoURL || undefined,
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        setCurrentUser(userData);
        toast.success('Account created successfully with Apple');
      }
    } catch (error: any) {
      console.error('Apple sign up error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show error
        console.log('User cancelled sign up by closing the popup');
        return;
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        return;
      } else if (error.code === 'auth/internal-error') {
        toast.error('An error occurred. Please try again or use email signup instead.');
      } else {
        toast.error('Failed to sign up with Apple');
      }
      throw error;
    }
  };

  // Sign in with phone number
  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: any): Promise<ConfirmationResult> => {
    try {
      console.log(`AuthContext: Starting phone sign-in with number: ${phoneNumber}`);
      console.log('AuthContext: RecaptchaVerifier:', recaptchaVerifier ? 'provided' : 'missing');
      console.log('AuthContext: RecaptchaVerifier type:', recaptchaVerifier?.type || 'unknown');
      
      // Verify the recaptchaVerifier is valid
      if (!recaptchaVerifier) {
        console.error('AuthContext: RecaptchaVerifier is null or undefined');
        throw new Error('reCAPTCHA verifier is missing. Please refresh and try again.');
      }
      
      // Send verification code
      console.log('AuthContext: About to call signInWithPhoneNumber...');
      
      // Test the reCAPTCHA verifier state
      try {
        console.log('AuthContext: reCAPTCHA container ID:', recaptchaVerifier._clientId || 'unknown');
        console.log('AuthContext: reCAPTCHA size:', recaptchaVerifier._parameters?.size || 'unknown');
      } catch (e) {
        console.log('AuthContext: Unable to log reCAPTCHA details:', e);
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      console.log('AuthContext: signInWithPhoneNumber succeeded');
      toast.success('Verification code sent to your phone!');
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Log additional error information that might be available
      if (error.customData) {
        console.error('Error custom data:', error.customData);
      }
      
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number. Please enter a valid number.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/captcha-check-failed') {
        toast.error('reCAPTCHA verification failed. Please try again.');
      } else if (error.code === 'auth/quota-exceeded') {
        toast.error('SMS quota exceeded. Please try again tomorrow.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/internal-error') {
        toast.error('An internal error occurred. Please try again later.');
      } else {
        toast.error('Failed to send verification code');
      }
      throw error;
    }
  };

  // Verify phone code for sign in
  const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string): Promise<void> => {
    try {
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      
      // Check if this user exists in our users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User exists, set current user from Firestore data
        const userData = userDoc.data();
        setCurrentUser({ 
          id: user.uid,
          ...userData,
          teams: userData.teams || [],
          leagues: userData.leagues || [],
          badges: userData.badges || []
        } as User);
        toast.success('Signed in successfully with phone number');
      } else {
        // User signed in with phone but doesn't have a profile
        // They need to complete registration
        await firebaseSignOut(auth);
        toast.error('Please sign up with your phone number first');
      }
    } catch (error: any) {
      console.error('Code verification error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid verification code. Please try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('Verification code has expired. Please request a new one.');
      } else {
        toast.error('Failed to verify code');
      }
      throw error;
    }
  };

  // Sign up with phone number - Step 1: Send the verification code
  const signUpWithPhone = async (
    phoneNumber: string, 
    recaptchaVerifier: any, 
    role: UserRole,
    displayName: string
  ): Promise<ConfirmationResult> => {
    try {
      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      toast.success('Verification code sent to your phone!');
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone sign up error:', error);
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number. Please enter a valid number.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Failed to send verification code');
      }
      throw error;
    }
  };

  // Verify phone code for sign up - Step 2: Verify code and create profile
  const verifyPhoneCodeForSignUp = async (
    confirmationResult: ConfirmationResult, 
    code: string, 
    role: UserRole,
    displayName: string
  ): Promise<User> => {
    try {
      console.log(`Verifying code for sign up with role: ${role}, displayName: ${displayName}`);
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData: User;
      
      if (userDoc.exists()) {
        console.log('User already exists in Firestore, updating current user state');
        // User already exists, just update current user state
        userData = { 
          id: user.uid,
          ...userDoc.data(),
          teams: userDoc.data().teams || [],
          leagues: userDoc.data().leagues || [],
          badges: userDoc.data().badges || []
        } as User;
        
        // Make sure the displayName is set
        if (!userData.displayName && displayName) {
          await setDoc(doc(db, 'users', user.uid), { displayName }, { merge: true });
          userData.displayName = displayName;
        }
        
        toast.success('Welcome back! You already have an account');
      } else {
        console.log('Creating new user profile in Firestore');
        // Create a new user profile
        userData = {
          id: user.uid,
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          displayName: displayName || 'New User',
          role,
          leagues: [],
          teams: [],
          badges: [],
          profilePicture: user.photoURL || undefined,
          createdAt: new Date()
        };
        
        console.log('User data to be saved:', userData);
        await setDoc(doc(db, 'users', user.uid), userData);
        toast.success('Account created successfully with phone number');
      }
      
      // Important: manually update the current user state
      setCurrentUser(userData);
      
      // Ensure the user state update is properly processed
      console.log('Phone auth: Setting current user state to:', userData);
      
      // Force a state update to ensure the user data is correctly propagated
      setTimeout(() => {
        if (!currentUser || currentUser.id !== userData.id) {
          console.log('Phone auth: Re-setting current user state to ensure update');
          setCurrentUser(userData);
        }
      }, 500);
      
      // Return the user data
      return userData;
    } catch (error: any) {
      console.error('Code verification error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid verification code. Please try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('Verification code has expired. Please request a new one.');
      } else {
        toast.error('Failed to verify code: ' + (error.message || error.code || 'Unknown error'));
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', currentUser.id);
      await setDoc(userRef, { ...currentUser, ...data }, { merge: true });
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!currentUser) return false;
    const roleHierarchy: Record<UserRole, number> = {
      admin: 5,
      league_manager: 4,
      manager: 3,
      coach: 2,
      player: 1,
      parent: 1
    };
    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
  };

  const isInLeague = (leagueId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.leagues.includes(leagueId);
  };

  const isInTeam = (teamId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.teams.includes(teamId);
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signInWithApple,
    signUpWithApple,
    signInWithPhone,
    verifyPhoneCode,
    signUpWithPhone,
    verifyPhoneCodeForSignUp,
    sendPasswordResetEmail,
    signOut,
    updateUserProfile,
    hasPermission,
    isInLeague,
    isInTeam
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};