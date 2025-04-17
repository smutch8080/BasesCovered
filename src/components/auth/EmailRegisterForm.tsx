import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import toast from 'react-hot-toast';
import { Trophy } from 'lucide-react';

interface EmailRegisterFormProps {
  onPhoneAuthClick: () => void;
}

export const EmailRegisterForm: React.FC<EmailRegisterFormProps> = ({ onPhoneAuthClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.player);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, displayName, role);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Failed to create account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo and Welcome Text */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 text-gray-900">
          <Trophy className="h-full w-full" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join our community of coaches and players
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={onPhoneAuthClick}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          <span className="mr-2">📱</span>
          Sign up with Phone
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                id="role-coach"
                name="role"
                type="radio"
                value={UserRole.coach}
                checked={role === UserRole.coach}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="sr-only"
              />
              <label
                htmlFor="role-coach"
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-brand-primary ${
                  role === UserRole.coach ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'
                }`}
              >
                <span className="text-base font-medium text-gray-900">Coach</span>
              </label>
            </div>
            
            <div className="relative">
              <input
                id="role-player"
                name="role"
                type="radio"
                value={UserRole.player}
                checked={role === UserRole.player}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="sr-only"
              />
              <label
                htmlFor="role-player"
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-brand-primary ${
                  role === UserRole.player ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'
                }`}
              >
                <span className="text-base font-medium text-gray-900">Player</span>
              </label>
            </div>

            <div className="relative">
              <input
                id="role-parent"
                name="role"
                type="radio"
                value={UserRole.parent}
                checked={role === UserRole.parent}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="sr-only"
              />
              <label
                htmlFor="role-parent"
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-brand-primary ${
                  role === UserRole.parent ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'
                }`}
              >
                <span className="text-base font-medium text-gray-900">Parent</span>
              </label>
            </div>

            <div className="relative">
              <input
                id="role-league-manager"
                name="role"
                type="radio"
                value={UserRole.league_manager}
                checked={role === UserRole.league_manager}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="sr-only"
              />
              <label
                htmlFor="role-league-manager"
                className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-brand-primary ${
                  role === UserRole.league_manager ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'
                }`}
              >
                <span className="text-base font-medium text-gray-900">League Manager</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/auth?mode=signin" className="font-medium text-brand-primary hover:text-brand-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
};