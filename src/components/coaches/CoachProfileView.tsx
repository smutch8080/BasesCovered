import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, Twitter, Instagram, Linkedin, Facebook, Trophy, Calendar, Users } from 'lucide-react';
import { User } from '../../types/auth';
import { CoachingLevel, PlayingHistory } from '../../types/coach';
import { RatingDisplay } from './RatingDisplay';

interface Props {
  coach: User;
  onBookService?: (service: any) => void;
}

export const CoachProfileView: React.FC<Props> = ({ coach, onBookService }) => {
  const { coachProfile } = coach;
  if (!coachProfile) return null;

  const location = `${coachProfile.location.city}, ${coachProfile.location.state}`;
  const averageRating = coachProfile.reviews?.reduce((sum, review) => sum + review.rating, 0) / (coachProfile.reviews?.length || 1) || 0;
  const reviewCount = coachProfile.reviews?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-6">
        {coachProfile.profilePicture ? (
          <img
            src={coachProfile.profilePicture}
            alt={coach.displayName}
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{coach.displayName}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{location}</span>
          </div>
          {coachProfile.coachingLevel && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full">
                {coachProfile.coachingLevel} Level Coach
              </span>
            </div>
          )}
          <div className="mt-2">
            <RatingDisplay rating={averageRating} reviewCount={reviewCount} size="lg" />
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Coaching Experience</h2>
          <div className="space-y-4">
            {coachProfile.coachingLevel && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-brand-primary" />
                <span>Current Level: {coachProfile.coachingLevel}</span>
              </div>
            )}
            {coachProfile.playingHistory && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-primary" />
                <span>Playing Experience: {coachProfile.playingHistory}</span>
              </div>
            )}
          </div>
          {coachProfile.teamsCoached && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Teams Coached</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{coachProfile.teamsCoached}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
          {coachProfile.bio && (
            <p className="text-gray-600 whitespace-pre-wrap mb-4">{coachProfile.bio}</p>
          )}
          {coachProfile.experience && (
            <p className="text-gray-600 whitespace-pre-wrap">{coachProfile.experience}</p>
          )}
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
        <p className="text-gray-600">{location}</p>
        <p className="text-gray-600 mt-2">
          <strong>Lessons held at:</strong> {coachProfile.lessonLocation}
        </p>
      </div>

      {/* Social Links */}
      {coachProfile.socialProfiles && Object.values(coachProfile.socialProfiles).some(Boolean) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connect</h2>
          <div className="flex flex-wrap gap-4">
            {coachProfile.socialProfiles.website && (
              <a
                href={coachProfile.socialProfiles.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-primary hover:opacity-80"
              >
                <Globe className="w-5 h-5" />
                <span>Website</span>
              </a>
            )}
            {coachProfile.socialProfiles.twitter && (
              <a
                href={coachProfile.socialProfiles.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-primary hover:opacity-80"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </a>
            )}
            {coachProfile.socialProfiles.instagram && (
              <a
                href={coachProfile.socialProfiles.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-primary hover:opacity-80"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </a>
            )}
            {coachProfile.socialProfiles.linkedin && (
              <a
                href={coachProfile.socialProfiles.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-primary hover:opacity-80"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            )}
            {coachProfile.socialProfiles.facebook && (
              <a
                href={coachProfile.socialProfiles.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-primary hover:opacity-80"
              >
                <Facebook className="w-5 h-5" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Services Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Services & Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coachProfile.services.map((service, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                {service.type} Lessons
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600">${service.price} per session</p>
                <p className="text-gray-600">{service.duration} minutes</p>
                <p className="text-gray-600">{service.description}</p>
                <p className="text-sm text-gray-500">
                  <strong>Available:</strong> {service.availability}
                </p>
                {onBookService && (
                  <button
                    onClick={() => onBookService(service)}
                    className="w-full mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg
                      hover:opacity-90 transition-colors"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};