import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(email);
      setSuccess(true);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Failed to send password reset email:', error);
      
      // Handle specific errors
      if (error.code === 'auth/user-not-found') {
        toast.error('No account exists with this email address');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address');
      } else {
        toast.error('Failed to send password reset email. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-brand-primary" />
            <h2 className="mt-6 text-3xl font-bold text-brand-dark">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-brand-muted">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <p className="font-medium">Reset link sent!</p>
                <p className="text-sm mt-1">Check your email ({email}) for a link to reset your password.</p>
              </div>
              
              <div className="mt-8 text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-brand-primary hover:text-brand-primary-dark"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="link inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage; 