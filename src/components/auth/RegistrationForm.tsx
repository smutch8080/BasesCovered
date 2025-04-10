import React, { useState } from 'react';
import { UserRole } from '../../types/auth';
import { LeagueType } from '../../types/league';
import { validateRegistrationForm, ValidationError } from '../../utils/validation';
import { Shield, User, Users, Trophy, MapPin, Phone } from 'lucide-react';
import { LocationAutocomplete } from '../teams/LocationAutocomplete';
import { useAuth } from '../../contexts/AuthContext';
import { PhoneAuthForm } from './PhoneAuthForm';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface Props {
  onSubmit: (data: { 
    email: string; 
    password: string; 
    displayName: string; 
    role: UserRole;
    league?: {
      name: string;
      type: LeagueType;
      location: {
        city: string;
        state: string;
        country: string;
        placeId: string;
      };
      website?: string;
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
    };
  }) => Promise<void>;
  loading: boolean;
}

export const RegistrationForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const { signUpWithGoogle, signUpWithApple } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: '' as UserRole,
    league: {
      name: '',
      type: LeagueType.Recreation,
      location: {
        city: '',
        state: '',
        country: 'USA',
        placeId: ''
      },
      website: '',
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    }
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (touched.has(name)) {
      const validationErrors = validateRegistrationForm(formData);
      setErrors(validationErrors);
    }
  };

  const handleLeagueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      league: {
        ...prev.league,
        [name]: value
      }
    }));
  };

  const handleLocationChange = (location: any) => {
    setFormData(prev => ({
      ...prev,
      league: {
        ...prev.league,
        location: {
          city: location.city,
          state: location.state,
          country: location.country || 'USA',
          placeId: location.placeId
        }
      }
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
    const validationErrors = validateRegistrationForm(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateRegistrationForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Only include league data if registering as a league manager
    const submitData = {
      ...formData,
      league: formData.role === 'league_manager' ? formData.league : undefined
    };

    await onSubmit(submitData);
  };

  const getFieldError = (field: string) => 
    errors.find(error => error.field === field)?.message;

  const handleRoleSelect = (role: UserRole) => {
    // Clear errors for role
    setErrors(errors.filter(error => error.field !== 'role'));
    setFormData(prev => ({ ...prev, role }));
  };

  const handleGoogleSignUp = async () => {
    if (!formData.role) {
      // Show error if no role selected
      setErrors([{ field: 'role', message: 'Please select a role before continuing with Google' }]);
      return;
    }

    try {
      setGoogleLoading(true);
      console.log('Starting Google sign up with role:', formData.role);
      await signUpWithGoogle(formData.role as UserRole);
      console.log('Google sign-up completed successfully, waiting for auth state to update');
      // The returnUrl will be handled by the parent RegisterPage component
      // when Google auth completes and the useEffect detects a valid currentUser
    } catch (error: any) {
      console.error('Failed to sign up with Google:', error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast.error('Failed to sign up with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    if (!formData.role) {
      // Show error if no role selected
      setErrors([{ field: 'role', message: 'Please select a role before continuing with Apple' }]);
      return;
    }

    try {
      setAppleLoading(true);
      console.log('Starting Apple sign up with role:', formData.role);
      await signUpWithApple(formData.role as UserRole);
      console.log('Apple sign-up completed successfully, waiting for auth state to update');
      // The returnUrl will be handled by the parent RegisterPage component
      // when Apple auth completes and the useEffect detects a valid currentUser
    } catch (error: any) {
      console.error('Failed to sign up with Apple:', error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast.error('Failed to sign up with Apple. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handlePhoneAuthSuccess = () => {
    // The PhoneAuthForm component handles navigation directly,
    // so we just log success here and don't do any additional navigation
    console.log('Phone authentication successful in RegistrationForm');
    console.log('Navigation handled by PhoneAuthForm component');
  };

  return (
    <form className="space-y-6 pb-20 lg:pb-0" onSubmit={handleSubmit}>
      {/* Role Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          I am a...
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            type="button"
            className={`flex items-center p-4 border rounded-lg ${
              formData.role === UserRole.coach ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => handleRoleSelect(UserRole.coach)}
          >
            <Shield className="h-6 w-6 mr-2 text-blue-500" />
            <span>Coach</span>
          </button>
          <button
            type="button"
            className={`flex items-center p-4 border rounded-lg ${
              formData.role === UserRole.player ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => handleRoleSelect(UserRole.player)}
          >
            <User className="h-6 w-6 mr-2 text-blue-500" />
            <span>Player</span>
          </button>
          <button
            type="button"
            className={`flex items-center p-4 border rounded-lg ${
              formData.role === UserRole.parent ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => handleRoleSelect(UserRole.parent)}
          >
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            <span>Parent</span>
          </button>
          <button
            type="button"
            className={`flex items-center p-4 border rounded-lg ${
              formData.role === UserRole.league_manager ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onClick={() => handleRoleSelect(UserRole.league_manager)}
          >
            <Trophy className="h-6 w-6 mr-2 text-blue-500" />
            <span>League Manager</span>
          </button>
        </div>
        {getFieldError('role') && (
          <p className="mt-1 text-sm text-red-500">{getFieldError('role')}</p>
        )}
      </div>

      {/* Continue with Google button */}
      {formData.role && showPhoneAuth ? (
        <div className="space-y-6">
          <PhoneAuthForm 
            mode="signup" 
            role={formData.role} 
            displayName={formData.displayName || `New ${formData.role}`} 
            onSuccess={handlePhoneAuthSuccess} 
          />
          <button
            type="button"
            onClick={() => setShowPhoneAuth(false)}
            className="mt-2 w-full text-center text-sm text-brand-primary hover:text-brand-primary-dark"
          >
            Back to signup options
          </button>
        </div>
      ) : formData.role ? (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Continue with</span>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || !formData.role}
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
              {googleLoading ? 'Signing up...' : 'Sign up with Google'}
            </button>
            
            {/* Commented out Apple Sign In Button
            <button
              type="button"
              onClick={handleAppleSignUp}
              disabled={appleLoading || !formData.role}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                <path d="M10 2c1 .5 2 2 2 5" />
              </svg>
              {appleLoading ? 'Signing up...' : 'Sign up with Apple'}
            </button>
            */}

            <button
              type="button"
              onClick={() => navigate('/phone-auth-test')}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <Phone className="h-5 w-5" />
              Sign up with Phone
            </button>
          </div>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Show email/password form only when phone auth is not active */}
      {!showPhoneAuth && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              onBlur={() => handleBlur('displayName')}
              required
              className={`appearance-none relative block w-full px-3 py-2 border
                ${getFieldError('displayName') ? 'border-red-500' : 'border-gray-300'}
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none
                focus:ring-brand-primary focus:border-brand-primary sm:text-sm`}
              placeholder="Enter your name"
            />
            {getFieldError('displayName') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('displayName')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
              className={`appearance-none relative block w-full px-3 py-2 border
                ${getFieldError('email') ? 'border-red-500' : 'border-gray-300'}
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none
                focus:ring-brand-primary focus:border-brand-primary sm:text-sm`}
              placeholder="Enter your email"
            />
            {getFieldError('email') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
              className={`appearance-none relative block w-full px-3 py-2 border
                ${getFieldError('password') ? 'border-red-500' : 'border-gray-300'}
                placeholder-gray-500 text-gray-900 rounded-md focus:outline-none
                focus:ring-brand-primary focus:border-brand-primary sm:text-sm`}
              placeholder="Create a password"
            />
            {getFieldError('password') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('password')}</p>
            )}
          </div>

          {/* League Manager Fields */}
          {formData.role === 'league_manager' && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">League Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  League Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.league.name}
                  onChange={handleLeagueChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter league name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  League Type
                </label>
                <select
                  name="type"
                  value={formData.league.type}
                  onChange={handleLeagueChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  {Object.values(LeagueType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <LocationAutocomplete
                  value={formData.league.location}
                  onChange={handleLocationChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  name="website"
                  type="url"
                  value={formData.league.website}
                  onChange={handleLeagueChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter league website"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    name="contactName"
                    type="text"
                    value={formData.league.contactName}
                    onChange={handleLeagueChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    placeholder="Enter contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    name="contactPhone"
                    type="tel"
                    value={formData.league.contactPhone}
                    onChange={handleLeagueChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.role || errors.length > 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent
              text-sm font-medium rounded-md text-white bg-brand-primary
              hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </>
      )}
    </form>
  );
};