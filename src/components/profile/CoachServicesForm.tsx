import React, { useState } from 'react';
import { CoachProfile, CoachingService, CoachingLevel, PlayingHistory } from '../../types/coach';
import { Trash2, Upload } from 'lucide-react';
import { LocationAutocomplete } from '../teams/LocationAutocomplete';
import { Location } from '../../types/team';

interface Props {
  initialData?: CoachProfile;
  onSubmit: (data: CoachProfile) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CoachServicesForm: React.FC<Props> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<CoachProfile>({
    isPublic: initialData?.isPublic || false,
    bio: initialData?.bio || '',
    experience: initialData?.experience || '',
    location: {
      city: initialData?.location?.city || '',
      state: initialData?.location?.state || ''
    },
    lessonLocation: initialData?.lessonLocation || '',
    services: initialData?.services || [],
    reviews: initialData?.reviews || [],
    coachingLevel: initialData?.coachingLevel,
    playingHistory: initialData?.playingHistory,
    teamsCoached: initialData?.teamsCoached || '',
    profilePicture: initialData?.profilePicture || '',
    socialProfiles: {
      twitter: initialData?.socialProfiles?.twitter || '',
      instagram: initialData?.socialProfiles?.instagram || '',
      linkedin: initialData?.socialProfiles?.linkedin || '',
      facebook: initialData?.socialProfiles?.facebook || '',
      website: initialData?.socialProfiles?.website || ''
    }
  });

  const handleAddService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        type: 'batting',
        price: 0,
        duration: 30,
        description: '',
        availability: ''
      }]
    }));
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleServiceChange = (index: number, field: keyof CoachingService, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { 
          ...service, 
          [field]: field === 'price' ? 
            Math.max(0, parseFloat(value) || 0) : 
            field === 'duration' ? 
              Math.max(15, parseInt(value) || 30) : 
              value 
        } : service
      )
    }));
  };

  const handleLocationChange = (location: Location) => {
    setFormData(prev => ({
      ...prev,
      location: {
        city: location.city,
        state: location.state
      }
    }));
  };

  const handleLessonLocationChange = (location: Location) => {
    setFormData(prev => ({
      ...prev,
      lessonLocation: `${location.city}, ${location.state}`
    }));
  };

  const handleSocialProfileChange = (platform: keyof typeof formData.socialProfiles, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialProfiles: {
        ...prev.socialProfiles,
        [platform]: value
      }
    }));
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.location.city || !formData.location.state) {
      alert('Please enter your location');
      return;
    }

    if (!formData.lessonLocation) {
      alert('Please enter where lessons will be held');
      return;
    }

    // Clean up services data
    const cleanedServices = formData.services.map(service => ({
      ...service,
      price: parseFloat(service.price.toString()) || 0,
      duration: parseInt(service.duration.toString()) || 30
    }));

    // Clean up social profiles - remove empty values
    const cleanedSocialProfiles = Object.entries(formData.socialProfiles).reduce((acc, [key, value]) => {
      if (value?.trim()) {
        acc[key as keyof typeof formData.socialProfiles] = value.trim();
      }
      return acc;
    }, {} as typeof formData.socialProfiles);

    // Submit cleaned data
    onSubmit({
      ...formData,
      services: cleanedServices,
      socialProfiles: cleanedSocialProfiles,
      reviews: formData.reviews || [] // Ensure reviews array exists
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="rounded text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-brand-dark">Make profile visible to the community</span>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Your Location
          </label>
          <LocationAutocomplete
            value={{
              city: formData.location.city,
              state: formData.location.state,
              country: 'USA',
              placeId: ''
            }}
            onChange={handleLocationChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Lesson Location
          </label>
          <LocationAutocomplete
            value={{
              city: formData.lessonLocation.split(',')[0] || '',
              state: formData.lessonLocation.split(',')[1]?.trim() || '',
              country: 'USA',
              placeId: ''
            }}
            onChange={handleLessonLocationChange}
          />
          <p className="text-sm text-brand-muted mt-1">
            Enter the location where you'll be conducting lessons
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            {formData.profilePicture && (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level of Coaching
          </label>
          <select
            value={formData.coachingLevel || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, coachingLevel: e.target.value as CoachingLevel }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">Select level...</option>
            {Object.values(CoachingLevel).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Playing History
          </label>
          <select
            value={formData.playingHistory || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, playingHistory: e.target.value as PlayingHistory }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">Select level...</option>
            {Object.values(PlayingHistory).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teams Coached
          </label>
          <textarea
            value={formData.teamsCoached}
            onChange={(e) => setFormData(prev => ({ ...prev, teamsCoached: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="List the teams you've coached..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Tell players about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience
          </label>
          <textarea
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Share your coaching experience..."
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Social Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialProfiles.twitter}
                onChange={(e) => handleSocialProfileChange('twitter', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Twitter profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialProfiles.instagram}
                onChange={(e) => handleSocialProfileChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Instagram profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialProfiles.linkedin}
                onChange={(e) => handleSocialProfileChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="LinkedIn profile URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialProfiles.facebook}
                onChange={(e) => handleSocialProfileChange('facebook', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Facebook profile URL"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.socialProfiles.website}
                onChange={(e) => handleSocialProfileChange('website', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Personal website URL"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Services Offered</h3>
            <button
              type="button"
              onClick={handleAddService}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Add Service
            </button>
          </div>

          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <select
                    value={service.type}
                    onChange={(e) => handleServiceChange(index, 'type', e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="batting">Batting Lessons</option>
                    <option value="pitching">Pitching Lessons</option>
                    <option value="catching">Catching Lessons</option>
                    <option value="fielding">Fielding Lessons</option>
                    <option value="strength">Strength Training</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={service.duration}
                      onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      min="15"
                      step="15"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={service.availability}
                      onChange={(e) => handleServiceChange(index, 'availability', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      placeholder="e.g., Weekdays after 4pm, Weekends 9am-5pm"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};