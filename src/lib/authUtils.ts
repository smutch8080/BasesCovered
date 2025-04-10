import { 
  PhoneAuthProvider, 
  signInWithCredential, 
  ConfirmationResult,
  RecaptchaVerifier 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '../types/auth';
import toast from 'react-hot-toast';

/**
 * Utility functions for phone authentication
 */

/**
 * Format a phone number ensuring it has a country code
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  
  // Remove all non-digit characters except plus sign
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it has a country code
  if (!cleaned.startsWith('+')) {
    return `+1${cleaned}`; // Default to US
  }
  
  return cleaned;
};

/**
 * Create a reCAPTCHA verifier for phone auth
 */
export const createRecaptchaVerifier = (containerId: string): RecaptchaVerifier => {
  try {
    console.log(`Creating reCAPTCHA verifier for container #${containerId}`);
    
    // Check if container exists
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID ${containerId} not found`);
      throw new Error(`reCAPTCHA container not found: ${containerId}`);
    }
    
    // Clear container
    container.innerHTML = '';
    // Add extra styling to ensure container is visible to reCAPTCHA but not user
    container.style.position = 'relative';
    console.log(`Container ${containerId} cleared and ready`);
    
    // Create the verifier with explicit parameters
    console.log('Initializing RecaptchaVerifier with auth and container');
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible', // Use invisible mode for better user experience
      callback: (response: string) => {
        console.log('reCAPTCHA verified successfully!');
        console.log('Response token:', response ? (response.substring(0, 10) + '...') : 'null');
        console.log('Phone verification should be proceeding now');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        toast.error('reCAPTCHA verification expired. Please try again.');
      },
      'error-callback': (error: any) => {
        console.error('reCAPTCHA error:', error);
        // Log detailed error information
        if (error) {
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', JSON.stringify(error));
        }
        toast.error('reCAPTCHA verification failed. Please refresh the page and try again.');
      }
    });
    
    // Render the widget
    console.log('Rendering reCAPTCHA widget...');
    verifier.render()
      .then((widgetId) => {
        console.log('reCAPTCHA rendered successfully with widget ID:', widgetId);
      })
      .catch((error) => {
        console.error('Failed to render reCAPTCHA:', error);
        if (error && error.message) {
          console.error('Error message:', error.message);
        }
        
        // Check for common issues
        if (error && error.message && error.message.includes('sitekey')) {
          console.error('Site key error detected - this often means the API key is restricted or incorrect');
          toast.error('reCAPTCHA configuration error: Invalid site key. Please contact support.');
        } else {
          toast.error('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
        }
      });
    
    console.log('reCAPTCHA verifier created and ready');
    return verifier;
  } catch (error: any) {
    console.error('Error creating reCAPTCHA verifier:', error);
    
    // Provide more detailed error information
    if (error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for common setup issues
    if (error && error.message && error.message.includes('reCAPTCHA')) {
      toast.error('reCAPTCHA initialization failed. Please check your internet connection and try again.');
    } else if (error && error.message && error.message.includes('network')) {
      toast.error('Network error when setting up phone verification. Please check your connection.');
    } else {
      toast.error('Failed to initialize phone verification. Please refresh the page.');
    }
    
    throw error;
  }
};

/**
 * Verify a phone confirmation code and create/update user in Firestore
 */
export const verifyPhoneConfirmationCode = async (
  confirmationResult: ConfirmationResult,
  code: string,
  role?: UserRole,
  displayName?: string
): Promise<User> => {
  try {
    console.log('Verifying phone confirmation code');
    
    // Confirm the verification code
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    console.log('Phone code verified successfully', { 
      uid: user.uid, 
      phoneNumber: user.phoneNumber 
    });
    
    // Check if this user already exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      // User exists, return the existing data
      console.log('User already exists in Firestore');
      
      const userData = userDoc.data();
      return { 
        id: user.uid,
        ...userData,
        teams: userData.teams || [],
        leagues: userData.leagues || [],
        badges: userData.badges || [],
        phoneNumber: user.phoneNumber || userData.phoneNumber
      } as User;
    } else if (role && displayName) {
      // Create a new user profile
      console.log('Creating new user in Firestore');
      
      // If photoURL is present use it, otherwise omit the profilePicture field completely
      const userPhotoURL = user.photoURL ? { profilePicture: user.photoURL } : {};
      
      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        displayName,
        role,
        leagues: [],
        teams: [],
        badges: [],
        createdAt: new Date(),
        ...userPhotoURL
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), newUser);
      console.log('New user saved to Firestore');
      
      return newUser;
    } else {
      throw new Error('Cannot create new user: missing role or displayName');
    }
  } catch (error) {
    console.error('Error verifying phone code:', error);
    throw error;
  }
}; 