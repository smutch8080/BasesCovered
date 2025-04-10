import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Trophy, Users, Shield } from 'lucide-react';
import { User } from '../../types/auth';
import { RatingDisplay } from './RatingDisplay';

interface Props {
  coach: User;
}

export const CoachCard: React.FC<Props> = ({ coach }) => {
  const profile = coach.coachProfile;
  if (!profile) return null;

  const services = profile.services.map(s => s.type.charAt(0).toUpperCase() + s.type.slice(1)).join(', ');
  const location = `${profile.location.city}, ${profile.location.state}`;
  const averageRating = profile.reviews?.reduce((sum, review) => sum + review.rating, 0) / (profile.reviews?.length || 1) || 0;
  const reviewCount = profile.reviews?.length || 0;

  return (
    <Link
      to={`/coaches/${coach.id}`}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-4 mb-4">
        {profile.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt={coach.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{coach.displayName}</h3>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {profile.coachingLevel && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-sm bg-brand-gradient text-white rounded-full">
            {profile.coachingLevel}
          </span>
        </div>
      )}

      <div className="mb-3">
        <RatingDisplay rating={averageRating} reviewCount={reviewCount} size="sm" />
      </div>

      {profile.bio && (
        <p className="text-gray-600 mb-4 line-clamp-2">{profile.bio}</p>
      )}

      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <strong>Services:</strong> {services}
        </div>
        {profile.experience && (
          <div className="text-sm text-gray-600 line-clamp-1">
            <strong>Experience:</strong> {profile.experience}
          </div>
        )}
      </div>
    </Link>
  );
};