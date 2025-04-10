import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { UserRole, User } from '../types/auth';
import { createRecaptchaVerifier, formatPhoneNumber, verifyPhoneConfirmationCode } from '../lib/authUtils';
import toast from 'react-hot-toast';

/**
 * A simple test page for phone authentication that bypasses the normal AuthContext
 * and directly uses Firebase Auth APIs with our utility helpers.
 */
const PhoneAuthTestPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  
  // Refs
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  
  // Add log
  const addLog = (message: string) => {
    console.log(`[PhoneAuthTest] ${message}`);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      addLog('Network connection restored');
      toast.success('You are back online!');
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      addLog('Network connection lost');
      toast.error('You are offline. Some features may not work.');
    };
    
    // Check initial status
    if (!navigator.onLine) {
      setNetworkStatus('offline');
      addLog('Currently offline');
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check current auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        addLog(`User is signed in: ${user.uid} (${user.phoneNumber || 'no phone'})`);
      } else {
        addLog('No user is signed in');
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Initialize reCAPTCHA on mount
  useEffect(() => {
    let initAttempts = 0;
    const maxAttempts = 3;
    
    const initReCaptcha = () => {
      try {
        initAttempts++;
        addLog(`Initializing reCAPTCHA verifier for test page (attempt ${initAttempts}/${maxAttempts})`);
        
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
            addLog('Cleared existing reCAPTCHA');
          } catch (e) {
            addLog(`Error clearing existing reCAPTCHA: ${e}`);
          }
        }
        
        const verifier = createRecaptchaVerifier('test-recaptcha-container');
        recaptchaVerifierRef.current = verifier;
        
        addLog('reCAPTCHA initialized successfully');
        return true;
      } catch (error: any) {
        addLog(`Failed to initialize reCAPTCHA: ${error.message || error}`);
        setError(`Failed to initialize verification. Please refresh the page. (${error.message || 'Unknown error'})`);
        return false;
      }
    };
    
    // Handle online/offline status
    const handleOnline = () => {
      setNetworkStatus('online');
      addLog('Network connection restored');
      toast.success('You are back online!');
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      addLog('Network connection lost');
      toast.error('You are offline. Some features may not work.');
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial setup
    if (navigator.onLine) {
      setNetworkStatus('online');
    } else {
      setNetworkStatus('offline');
    }
    
    // Initialize reCAPTCHA
    initReCaptcha();
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          addLog('Cleaned up reCAPTCHA on unmount');
        } catch (e) {
          console.error('Error clearing reCAPTCHA on unmount:', e);
        }
      }
    };
  }, []);
  
  // Send verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('sending');
    const formattedPhone = formatPhoneNumber(phoneNumber.trim());
    
    if (!formattedPhone) {
      setError('Please enter a phone number');
      setStatus('idle');
      return;
    }
    
    try {
      // Define local initReCaptcha function to avoid linter errors
      const initRecaptcha = () => {
        try {
          addLog(`Initializing reCAPTCHA verifier for phone verification`);
          
          if (recaptchaVerifierRef.current) {
            try {
              recaptchaVerifierRef.current.clear();
              addLog('Cleared existing reCAPTCHA');
            } catch (e) {
              addLog(`Error clearing existing reCAPTCHA: ${e}`);
            }
          }
          
          const verifier = createRecaptchaVerifier('test-recaptcha-container');
          recaptchaVerifierRef.current = verifier;
          
          addLog('reCAPTCHA initialized successfully');
          return true;
        } catch (error: any) {
          addLog(`Failed to initialize reCAPTCHA: ${error.message || error}`);
          setError(`Failed to initialize verification. Please refresh the page. (${error.message || 'Unknown error'})`);
          return false;
        }
      };
      
      // Initialize reCAPTCHA if needed
      if (!recaptchaVerifierRef.current) {
        const initSuccess = initRecaptcha();
        if (!initSuccess) {
          throw new Error('Failed to initialize reCAPTCHA. Please refresh the page and try again.');
        }
        
        // Give a moment for reCAPTCHA to fully initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addLog(`Sending verification code to ${formattedPhone}`);
      addLog(`Using reCAPTCHA type: ${recaptchaVerifierRef.current?.type || 'unknown'}`);
      addLog(`reCAPTCHA container: ${document.getElementById('test-recaptcha-container') ? 'found' : 'not found'}`);
      
      try {
        // Test the Firebase connection before attempting to send the verification code
        await auth.tenantId;
        addLog('Firebase Auth connection test successful');
      } catch (connError: any) {
        addLog(`Firebase Auth connection test failed: ${connError.message}`);
        throw new Error(`Failed to connect to Firebase Authentication service: ${connError.message}`);
      }
      
      // Add detailed logging for debugging
      addLog(`Using Firebase Auth project: ${auth.app.options.projectId || 'unknown'}`);
      addLog(`Using API key: ${auth.app.options.apiKey ? 'configured' : 'missing'}`);
      
      // Check for null to make TypeScript happy
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA verifier is null after initialization');
      }
      
      // Directly use Firebase Auth API with explicit try/catch
      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth, 
          formattedPhone, 
          recaptchaVerifierRef.current
        );
        
        addLog('Verification code sent successfully');
        addLog(`Confirmation result: ${confirmationResult ? 'received' : 'null'}`);
        setConfirmationResult(confirmationResult);
        setCodeSent(true);
        toast.success('Verification code sent to your phone!');
      } catch (signInError: any) {
        // Detailed error handling for signInWithPhoneNumber
        addLog(`signInWithPhoneNumber error: ${signInError.code} - ${signInError.message}`);
        
        // Reset reCAPTCHA on certain errors
        if (
          signInError.code === 'auth/captcha-check-failed' || 
          signInError.code === 'auth/missing-verification-code' ||
          signInError.code === 'auth/timeout'
        ) {
          try {
            addLog('Attempting to reset reCAPTCHA due to error');
            if (recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current.clear();
            }
            recaptchaVerifierRef.current = null;
            initRecaptcha();
          } catch (resetError) {
            addLog(`Error resetting reCAPTCHA: ${resetError}`);
          }
        }
        
        throw signInError; // Re-throw to be caught by outer try/catch
      }
    } catch (error: any) {
      addLog(`Error sending verification code: ${error.code} - ${error.message}`);
      
      if (error.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please include country code (e.g., +1)');
        toast.error('Invalid phone number format. Please include country code (e.g., +1)');
        addLog('Error: Invalid phone number format');
      } else if (error.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA verification failed. Please try again.');
        toast.error('reCAPTCHA verification failed. Please try again.');
        addLog('Error: reCAPTCHA verification failed');
      } else if (error.code === 'auth/quota-exceeded') {
        setError('Quota exceeded. Please try again later.');
        toast.error('SMS quota exceeded. Please try again later or use a different authentication method.');
        addLog('Error: SMS quota exceeded');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
        toast.error('Too many attempts. Please try again later.');
        addLog('Error: Too many requests');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
        toast.error('Network error. Please check your connection and try again.');
        addLog('Error: Network request failed');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Phone authentication is not enabled for this project.');
        toast.error('Phone authentication is not enabled for this Firebase project. Please contact support.');
        addLog('Error: Phone auth not enabled in Firebase');
      } else {
        setError(`Failed to send verification code: ${error.message || 'Unknown error'}`);
        toast.error('Failed to send verification code. Please try again or use a different authentication method.');
        addLog(`Unhandled error: ${error.message || 'Unknown'}`);
      }
    } finally {
      setStatus('idle');
    }
  };
  
  // Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (networkStatus === 'offline') {
      setError('You are offline. Please check your internet connection and try again.');
      toast.error('You are offline. Please check your internet connection.');
      return;
    }
    
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid 6-digit verification code');
      toast.error('Please enter a valid 6-digit verification code');
      addLog('Invalid verification code format');
      return;
    }
    
    if (!confirmationResult) {
      setError('No verification session found. Please request a new code.');
      toast.error('Verification session expired. Please request a new code.');
      addLog('No confirmation result found for verification');
      return;
    }
    
    try {
      setLoading(true);
      addLog(`Verifying code: ${verificationCode}`);
      
      // Use our utility function
      const user = await verifyPhoneConfirmationCode(
        confirmationResult,
        verificationCode,
        UserRole.player, // Default role for test
        'Test User'      // Default name for test
      );
      
      addLog(`Phone authentication successful: ${user.id} (${user.phoneNumber || 'no phone'})`);
      addLog(`User display name: ${user.displayName || 'not set'}`);
      addLog(`User email: ${user.email || 'not set'}`);
      
      toast.success('Phone authentication successful!');
      
      // Check if user is properly authenticated
      const currentUser = auth.currentUser;
      addLog(`Current user after verification: ${currentUser ? currentUser.uid : 'none'}`);
      
      // Navigate to success page
      addLog('Will navigate to auth success page in 1 second');
      setTimeout(() => {
        navigate('/auth-success');
        addLog('Navigated to auth success page');
      }, 1000);
    } catch (error: any) {
      addLog(`Error verifying code: ${error.code} - ${error.message}`);
      
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please check and try again.');
        toast.error('Invalid verification code. Please check and try again.');
        addLog('Error: Invalid verification code');
      } else if (error.code === 'auth/code-expired') {
        setError('Verification code has expired. Please request a new one.');
        toast.error('Verification code has expired. Please request a new one.');
        setCodeSent(false);
        addLog('Error: Verification code expired');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Firebase could not connect to the authentication server. Please check your internet connection.');
        toast.error('Network connection error. Please check your internet and try again.');
        addLog('Error: Network request failed');
        setNetworkStatus('offline');
      } else {
        setError(`Verification failed: ${error.message || error.code || 'Unknown error'}`);
        toast.error(`Verification failed: ${error.message || error.code || 'Unknown error'}`);
        addLog(`Unknown verification error: ${error.code || 'no code'} - ${error.message || 'no message'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Retry button for network issues
  const handleRetryConnection = () => {
    setNetworkStatus('online');
    addLog('Retrying connection...');
    
    // Try to reinitialize reCAPTCHA if needed
    if (!recaptchaVerifierRef.current) {
      try {
        const verifier = createRecaptchaVerifier('test-recaptcha-container');
        recaptchaVerifierRef.current = verifier;
        addLog('reCAPTCHA reinitialized on retry');
      } catch (e: any) {
        addLog(`Failed to reinitialize reCAPTCHA on retry: ${e.message || e}`);
      }
    }
  };
  
  // Toggle showing Firebase config debug info
  const toggleFirebaseConfig = () => {
    setShowFirebaseConfig(!showFirebaseConfig);
    if (!showFirebaseConfig) {
      addLog('Showing Firebase config info');
    } else {
      addLog('Hiding Firebase config info');
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Phone Authentication Test
      </h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      
      {networkStatus === 'offline' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md text-sm mb-4 flex justify-between items-center">
          <span>You appear to be offline. Please check your connection.</span>
          <button 
            onClick={handleRetryConnection}
            className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded"
          >
            Retry
          </button>
        </div>
      )}
      
      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading || networkStatus === 'offline'}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Include country code (e.g., +1 for US)
            </p>
          </div>
          
          {/* reCAPTCHA container */}
          <div 
            id="test-recaptcha-container" 
            className="flex justify-center my-4"
          ></div>
          
          <button
            type="submit"
            disabled={loading || networkStatus === 'offline'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            Back to Registration
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading || networkStatus === 'offline'}
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setCodeSent(false)}
              disabled={loading || networkStatus === 'offline'}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || networkStatus === 'offline'}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>
      )}
      
      {/* Troubleshooting Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Troubleshooting</h3>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs">
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            <strong>Not receiving verification codes?</strong> Try the following:
          </p>
          <ol className="list-decimal pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Make sure you're using a valid phone number with country code (e.g., +1 for US)</li>
            <li>Check if your Firebase project is set up for phone authentication</li>
            <li>Verify the phone number is not blocked or restricted</li>
            <li>Try using a different phone number</li>
            <li>Ensure you're not using an emulator or virtual device</li>
            <li>Check if your Firebase project has exceeded its SMS quota</li>
          </ol>
          <button 
            onClick={toggleFirebaseConfig}
            className="text-brand-primary hover:underline text-xs"
          >
            {showFirebaseConfig ? 'Hide Firebase Info' : 'Show Firebase Info'}
          </button>
          
          {showFirebaseConfig && (
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Auth config:</strong> {auth?.app?.options?.apiKey ? 'Configured' : 'Not configured'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Project ID:</strong> {auth?.app?.options?.projectId || 'Not available'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Auth domain:</strong> {auth?.app?.options?.authDomain || 'Not available'}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Using emulator:</strong> {import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug logs section */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Logs</h3>
          <button 
            onClick={() => setDebugLogs([])}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            Clear
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs font-mono h-48 overflow-y-auto">
          {debugLogs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No logs yet...</p>
          ) : (
            debugLogs.map((log, i) => (
              <div key={i} className="mb-1 pb-1 border-b border-gray-100 dark:border-gray-800">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneAuthTestPage; 