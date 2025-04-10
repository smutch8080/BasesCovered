import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { initRecaptchaVerifier } from '../../lib/firebase';
import { ConfirmationResult, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';
import { UserRole } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import { formatPhoneNumber, createRecaptchaVerifier, verifyPhoneConfirmationCode } from '../../lib/authUtils';
import PhoneInput from '../ui/PhoneInput';
import { parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';

interface PhoneAuthFormProps {
  mode: 'signin' | 'signup';
  role?: UserRole;
  displayName?: string;
  onSuccess: () => void;
}

export const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({
  mode,
  role,
  displayName = '',
  onSuccess
}) => {
  // Get auth context and router hooks
  const { signInWithPhone, signUpWithPhone } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneInputError, setPhoneInputError] = useState(false);
  
  // Refs
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<any>(null);
  
  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const initCaptcha = () => {
      try {
        console.log('Initializing reCAPTCHA verifier');
        
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch (e) {
            console.error('Error clearing existing reCAPTCHA:', e);
          }
          recaptchaVerifierRef.current = null;
        }
        
        // Only proceed if component is still mounted
        if (!isMounted) return;
        
        // Added timeout to ensure DOM is ready
        timeoutId = setTimeout(() => {
          if (!isMounted) return;
          
          try {
            // Ensure container exists
            const container = document.getElementById('recaptcha-container');
            if (!container) {
              console.error('reCAPTCHA container not found');
              return;
            }
            
            // Clear container just in case
            container.innerHTML = '';
            
            const verifier = createRecaptchaVerifier('recaptcha-container');
            recaptchaVerifierRef.current = verifier;
            console.log('reCAPTCHA initialized successfully with type:', 
                    verifier?.type || 'unknown', 'should be invisible');
          } catch (innerError) {
            console.error('Failed to initialize reCAPTCHA inside timeout:', innerError);
            if (isMounted) {
              setError('Could not initialize verification. Please refresh the page and try again.');
            }
          }
        }, 500); // Shorter initial timeout
      } catch (error) {
        console.error('Failed to initialize reCAPTCHA:', error);
        if (isMounted) {
          setError('Failed to initialize verification. Please refresh the page.');
        }
      }
    };
    
    // Initialize reCAPTCHA
    initCaptcha();
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          console.log('reCAPTCHA cleaned up');
        } catch (e) {
          console.error('Error cleaning up reCAPTCHA:', e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Handle phone number change
  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneInputError(false);
  };

  // Validate the phone number
  const validatePhoneNumber = (value: string): boolean => {
    if (!value) {
      setPhoneInputError(true);
      return false;
    }

    // Use the isValidPhoneNumber utility
    try {
      const isValid = isValidPhoneNumber(value);
      setPhoneInputError(!isValid);
      return isValid;
    } catch (e) {
      setPhoneInputError(true);
      return false;
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate phone number first
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number');
      toast.error('Please enter a valid phone number');
      return;
    }
    
    // Format the phone number properly (should already be in E.164 format)
    const formattedPhone = phoneNumber;
    
    // Define a local function to initialize reCAPTCHA
    const initRecaptcha = () => {
      try {
        console.log(`Initializing reCAPTCHA verifier for phone auth form`);
        
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
            console.log('Cleared existing reCAPTCHA');
          } catch (e) {
            console.error('Error clearing existing reCAPTCHA:', e);
          }
        }
        
        const verifier = createRecaptchaVerifier('recaptcha-container');
        recaptchaVerifierRef.current = verifier;
        
        console.log('reCAPTCHA initialized successfully');
        return true;
      } catch (error: any) {
        console.error('Failed to initialize reCAPTCHA:', error);
        return false;
      }
    };
    
    // Initialize reCAPTCHA if needed
    if (!recaptchaVerifierRef.current) {
      const initSuccess = initRecaptcha();
      if (!initSuccess) {
        setError('Failed to initialize verification. Please refresh the page and try again.');
        toast.error('reCAPTCHA initialization failed. Please refresh and try again.');
        return;
      }
      
      // Give reCAPTCHA a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
      setLoading(true);
      console.log(`Sending verification code to ${formattedPhone} with mode ${mode}`);
      
      // Check for null to make TypeScript happy
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA verifier is null after initialization');
      }
      
      // Provide information about the reCAPTCHA state
      console.log(`Using reCAPTCHA type: ${recaptchaVerifierRef.current?.type || 'unknown'}`);
      console.log(`reCAPTCHA container: ${document.getElementById('recaptcha-container') ? 'found' : 'not found'}`);
      
      // Use the appropriate method based on the mode
      try {
        let result;
        
        if (mode === 'signin') {
          // Sign in with phone
          console.log('Using signInWithPhone from AuthContext');
          result = await signInWithPhone(formattedPhone, recaptchaVerifierRef.current);
        } else {
          // Sign up with phone
          console.log('Using signUpWithPhone from AuthContext with role:', role);
          result = await signUpWithPhone(formattedPhone, recaptchaVerifierRef.current, role || UserRole.player, displayName);
        }
        
        console.log('Phone verification code sent successfully');
        setConfirmationResult(result);
        setCodeSent(true);
        toast.success('Verification code sent! Check your phone.');
      } catch (signInError: any) {
        // Detailed error handling for phone verification
        console.error(`Phone auth error: ${signInError.code} - ${signInError.message}`);
        
        // Reset reCAPTCHA on certain errors
        if (
          signInError.code === 'auth/captcha-check-failed' || 
          signInError.code === 'auth/missing-verification-code' ||
          signInError.code === 'auth/timeout'
        ) {
          try {
            console.log('Attempting to reset reCAPTCHA due to error');
            if (recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current.clear();
            }
            recaptchaVerifierRef.current = null;
            toast.success('reCAPTCHA has been reset. Please try again.');
            initRecaptcha();
          } catch (resetError) {
            console.error('Error resetting reCAPTCHA:', resetError);
          }
        }
        
        throw signInError; // Re-throw to be caught by outer try/catch
      }
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(error.message || 'Failed to send code');
      
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format. Please check your number and try again.');
        setPhoneInputError(true);
      } else if (error.code === 'auth/quota-exceeded') {
        toast.error('SMS quota exceeded. Please try again later or contact support.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to send verification code. Please try again or use a different authentication method.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid 6-digit verification code');
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }
    
    if (!confirmationResult) {
      setError('No verification session found. Please request a new code.');
      toast.error('Verification session expired. Please request a new code.');
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Verifying code in ${mode} mode`);
      
      // Use our utility function to verify the code and create/get user
      const user = await verifyPhoneConfirmationCode(
        confirmationResult,
        verificationCode,
        mode === 'signup' ? role : undefined,
        mode === 'signup' ? displayName : undefined
      );
      
      console.log('Authentication successful, user data:', user);
      
      // Show success message
      toast.success(`Phone ${mode === 'signin' ? 'sign in' : 'registration'} successful!`);
      
      // Call the onSuccess callback
      console.log('Calling onSuccess callback from PhoneAuthForm');
      onSuccess();
      
      // Wait a moment to make sure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to success page instead of home
      console.log('Navigating to auth success page...');
      navigate('/auth-success');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setError(error.message || 'Failed to verify code');
      
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid verification code. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('Verification code has expired. Please request a new one.');
        setCodeSent(false);
      } else {
        toast.error(`Verification failed: ${error.message || error.code || 'Unknown error'}`);
      }
    } finally {
      setLoading(false); // Always reset loading state regardless of errors
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              disabled={loading}
              error={phoneInputError}
              required={true}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select your country code and enter your phone number
            </p>
          </div>
          
          {/* reCAPTCHA container */}
          <div 
            id="recaptcha-container" 
            ref={recaptchaContainerRef}
            className="flex justify-center my-4"
            style={{ height: '1px', overflow: 'hidden', visibility: 'hidden' }}
          ></div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              disabled={loading}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setCodeSent(false)}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}; 