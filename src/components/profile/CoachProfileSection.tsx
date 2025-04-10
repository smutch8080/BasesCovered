import React, { useState } from 'react';
import { User } from 'lucide-react';
import { CoachProfile } from '../../types/coach';
import { CoachServicesForm } from './CoachServicesForm';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { compressImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

interface Props {
  userId: string;
  profile?: CoachProfile;
  onProfileUpdated: (profile: CoachProfile) => void;
}

export const CoachProfileSection: React.FC<Props> = ({ userId, profile, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (updatedProfile: CoachProfile) => {
    try {
      setIsLoading(true);

      // Compress profile picture if it exists and is a data URL
      let profilePicture = updatedProfile.profilePicture;
      if (profilePicture?.startsWith('data:image')) {
        profilePicture = await compressImage(profilePicture, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.8
        });
      }

      // Clean and validate the profile data
      const profileData: CoachProfile = {
        isPublic: updatedProfile.isPublic,
        bio: updatedProfile.bio || '',
        experience: updatedProfile.experience || '',
        location: {
          city: updatedProfile.location.city,
          state: updatedProfile.location.state
        },
        lessonLocation: updatedProfile.lessonLocation,
        services: updatedProfile.services.map(service => ({
          type: service.type,
          price: Number(service.price),
          duration: Number(service.duration),
          description: service.description.slice(0, 500), // Limit description length
          availability: service.availability
        })),
        reviews: profile?.reviews || [], // Preserve existing reviews
        coachingLevel: updatedProfile.coachingLevel,
        playingHistory: updatedProfile.playingHistory,
        teamsCoached: updatedProfile.teamsCoached || '',
        profilePicture: profilePicture || '',
        socialProfiles: {
          twitter: updatedProfile.socialProfiles?.twitter || '',
          instagram: updatedProfile.socialProfiles?.instagram || '',
          linkedin: updatedProfile.socialProfiles?.linkedin || '',
          facebook: updatedProfile.socialProfiles?.facebook || '',
          website: updatedProfile.socialProfiles?.website || ''
        }
      };

      // Update user document with coach profile
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coachProfile: profileData
      });

      onProfileUpdated(profileData);
      setIsEditing(false);
      toast.success('Coach profile updated successfully');
    } catch (error: any) {
      console.error('Error updating coach profile:', error);
      
      if (error.code === 'invalid-argument') {
        toast.error('Profile data is too large. Please use a smaller profile picture.');
      } else if (error.code === 'permission-denied') {
        toast.error('You do not have permission to update this profile.');
      } else {
        toast.error('Failed to update coach profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing && !profile) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-brand-dark">Coach Profile</h2>
        </div>

        <div className="text-center py-8">
          <p className="text-brand-muted mb-4">
            Set up your coaching profile to offer private lessons and be discoverable by players.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-brand-dark">Coach Profile</h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-outline"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <CoachServicesForm
          initialData={profile}
          onSubmit={handleSubmit}
          onCancel={() => setIsEditing(false)}
          isLoading={isLoading}
        />
      ) : profile && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-brand-dark font-medium">Profile Visibility:</span>
              <span className={profile.isPublic ? 'text-brand-success' : 'text-brand-muted'}>
                {profile.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          {profile.bio && (
            <div>
              <h3 className="font-medium text-brand-dark mb-2">About</h3>
              <p className="text-brand-muted whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {profile.experience && (
            <div>
              <h3 className="font-medium text-brand-dark mb-2">Experience</h3>
              <p className="text-brand-muted whitespace-pre-wrap">{profile.experience}</p>
            </div>
          )}

          <div>
            <h3 className="font-medium text-brand-dark mb-2">Location</h3>
            <p className="text-brand-muted">{profile.location.city}, {profile.location.state}</p>
            <p className="text-brand-muted mt-1">Lessons held at: {profile.lessonLocation}</p>
          </div>

          <div>
            <h3 className="font-medium text-brand-dark mb-4">Services Offered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.services.map((service, index) => (
                <div key={index} className="bg-brand-light rounded-lg p-4">
                  <h4 className="font-medium text-brand-dark capitalize mb-2">
                    {service.type} Lessons
                  </h4>
                  <div className="text-sm text-brand-muted space-y-1">
                    <p>${service.price} / {service.duration} minutes</p>
                    <p>{service.description}</p>
                    <p className="text-brand-muted">{service.availability}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};