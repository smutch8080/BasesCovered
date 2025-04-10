import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Mail, Lock, Trophy } from 'lucide-react';
import { BadgesList } from '../components/profile/BadgesList';
import { CoachProfileSection } from '../components/profile/CoachProfileSection';
import { BookingRequestsList } from '../components/coaches/BookingRequestsList';
import { CoachProfile } from '../types/coach';
import { ProfileImageUpload } from '../components/profile/ProfileImageUpload';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function ProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(currentUser?.profilePicture || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsLoading(true);

      const updates: any = {
        displayName,
        profilePicture: profileImage
      };

      // Update display name and profile picture in Firestore
      if (displayName !== currentUser.displayName || profileImage !== currentUser.profilePicture) {
        await updateDoc(doc(db, 'users', currentUser.id), updates);
        toast.success('Profile updated successfully');
      }

      // Update email if changed
      if (email !== currentUser.email && currentPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        
        await reauthenticateWithCredential(auth.currentUser!, credential);
        await updateEmail(auth.currentUser!, email);
        
        await updateDoc(doc(db, 'users', currentUser.id), {
          email
        });
        
        toast.success('Email updated successfully');
      }

      // Update password if provided
      if (newPassword && currentPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        
        await reauthenticateWithCredential(auth.currentUser!, credential);
        await updatePassword(auth.currentUser!, newPassword);
        
        toast.success('Password updated successfully');
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password')) {
          toast.error('Current password is incorrect');
        } else if (error.message.includes('auth/requires-recent-login')) {
          toast.error('Please sign in again to update your security settings');
          navigate('/login');
        } else {
          toast.error('Failed to update profile');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoachProfileUpdate = async (profile: CoachProfile) => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.id), {
        coachProfile: profile
      });
      
      toast.success('Coach profile updated successfully');
    } catch (error) {
      console.error('Error updating coach profile:', error);
      toast.error('Failed to update coach profile');
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const isCoach = currentUser.role === 'coach' || currentUser.role === 'admin';

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <UserCircle className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profile Picture
                </label>
                <ProfileImageUpload
                  currentImage={profileImage}
                  onChange={setProfileImage}
                  size="md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {isCoach && (
            <>
              <CoachProfileSection
                userId={currentUser.id}
                profile={currentUser.coachProfile}
                onProfileUpdated={handleCoachProfileUpdate}
              />

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-6 h-6 text-brand-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">Booking Requests</h2>
                </div>

                <BookingRequestsList coachId={currentUser.id} />
              </div>
            </>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-brand-primary" />
              <h2 className="text-xl font-semibold text-gray-800">Achievements</h2>
            </div>

            <BadgesList badges={currentUser.badges || []} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ProfilePage;