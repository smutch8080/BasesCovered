import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStoredAuthIntent, clearStoredAuthIntent, getAuthContextMessage, getAuthHeaderTitle } from '../utils/authIntent';
import { PageLayout } from '../components/layout/PageLayout';
import { PhoneAuthForm } from '../components/auth/PhoneAuthForm';
import { EmailLoginForm } from '../components/auth/EmailLoginForm';
import { EmailRegisterForm } from '../components/auth/EmailRegisterForm';

interface AuthMode {
  mode: 'signin' | 'signup';
  view: 'email' | 'phone';
}

function AuthPage() {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    // Convert 'register' to 'signup' for our internal state
    const urlMode = searchParams.get('mode');
    return {
      mode: urlMode === 'register' ? 'signup' : urlMode === 'signup' ? 'signup' : 'signin',
      view: 'email'
    };
  });
  
  // Update auth mode when URL params change
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    setAuthMode(prev => ({
      ...prev,
      mode: urlMode === 'register' ? 'signup' : urlMode === 'signup' ? 'signup' : 'signin'
    }));
  }, [searchParams]);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [intentMode] = useState(() => getStoredAuthIntent());

  useEffect(() => {
    if (currentUser) {
      clearStoredAuthIntent();
      navigate('/auth-success');
    }
  }, [currentUser, navigate]);

  const handlePhoneAuthSuccess = () => {
    // Auth success will be handled by the useEffect above
    console.log('Phone authentication successful');
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="min-h-screen flex">
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1482632322416-218f4e111f73"
            alt="Softball player"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="max-w-md w-full space-y-8">
            {/* Intent Context Message */}
            {intentMode && (
              <div className="text-center text-sm text-gray-600">
                {getAuthContextMessage(intentMode.returnPath)}
              </div>
            )}

            {/* Auth Forms */}
            <div>
              {authMode.view === 'email' ? (
                authMode.mode === 'signin' ? (
                  <EmailLoginForm 
                    onPhoneAuthClick={() => setAuthMode(prev => ({ ...prev, view: 'phone' }))}
                  />
                ) : (
                  <EmailRegisterForm 
                    onPhoneAuthClick={() => setAuthMode(prev => ({ ...prev, view: 'phone' }))}
                  />
                )
              ) : (
                <PhoneAuthForm 
                  mode={authMode.mode}
                  onSuccess={handlePhoneAuthSuccess}
                  onEmailClick={() => setAuthMode(prev => ({ ...prev, view: 'email' }))}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default AuthPage; 