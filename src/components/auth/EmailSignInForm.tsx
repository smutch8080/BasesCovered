import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const EmailSignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      // Auth success handled by parent component's useEffect
    } catch (error) {
      console.error('Failed to sign in:', error);
      toast.error('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 input"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 input"
          placeholder="Enter your password"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-muted">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="/forgot-password" className="link">
            Forgot your password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex justify-center"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}; 