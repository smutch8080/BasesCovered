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

interface LocationData {
  city: string;
  state: string;
  country: string;
  placeId: string;
}

export const RegistrationForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const { signUpWithGoogle } = useAuth();
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

  const handleLocationChange = (location: LocationData) => {
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

  const handlePhoneAuthSuccess = () => {
    // The PhoneAuthForm component handles navigation directly,
    // so we just log success here and don't do any additional navigation
    console.log('Phone authentication successful in RegistrationForm');
    console.log('Navigation handled by PhoneAuthForm component');
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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