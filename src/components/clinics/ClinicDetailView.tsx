import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Mail, Phone, Clock, FileText, Image, Video } from 'lucide-react';
import { Clinic, ClinicRegistration } from '../../types/clinic';
import { useAuth } from '../../contexts/AuthContext';
import { ClinicRegistrationForm } from './ClinicRegistrationForm';
import { PodManagement } from './PodManagement';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface Props {
  clinic: Clinic;
  onClinicUpdated: (clinic: Clinic) => void;
  registrations?: ClinicRegistration[];
}

export const ClinicDetailView: React.FC<Props> = ({
  clinic,
  onClinicUpdated,
  registrations = []
}) => {
  const { currentUser } = useAuth();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const isCoach = currentUser?.id === clinic.createdBy || currentUser?.role === 'admin';
  const isMultiDay = clinic.startDate.toDateString() !== clinic.endDate.toDateString();
  const spotsLeft = clinic.maxParticipants - clinic.currentParticipants;

  const userRegistration = currentUser && registrations.find(
    reg => reg.userId === currentUser.id
  );

  const getRegistrationStatus = () => {
    if (!userRegistration) return null;
    switch (userRegistration.status) {
      case 'confirmed':
        return <span className="text-green-600">Registration Confirmed</span>;
      case 'pending':
        return <span className="text-yellow-600">Registration Pending</span>;
      case 'waitlisted':
        return <span className="text-orange-600">On Waitlist</span>;
      case 'cancelled':
        return <span className="text-red-600">Registration Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{clinic.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {isMultiDay ? (
                  `${formatDate(clinic.startDate)} - ${formatDate(clinic.endDate)}`
                ) : (
                  `${formatDate(clinic.startDate)}, ${formatTime(clinic.startDate)} - ${formatTime(clinic.endDate)}`
                )}
              </span>
            </div>
          </div>
          {clinic.fee && (
            <div className="flex items-center gap-1 text-2xl font-bold text-brand-primary">
              <DollarSign className="w-6 h-6" />
              {clinic.fee}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{clinic.location.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>
                {spotsLeft > 0 ? (
                  `${spotsLeft} spots left`
                ) : (
                  'Waitlist available'
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{clinic.skillLevel} Level • {clinic.ageGroup}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{clinic.contactEmail}</span>
            </div>
            {clinic.contactPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{clinic.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        {!isCoach && (
          <div className="mt-6 pt-6 border-t">
            {getRegistrationStatus() || (
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="w-full sm:w-auto px-6 py-3 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                Register Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Clinic</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: clinic.description }} />
      </div>

      {/* Pods Section */}
      {clinic.pods.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Pods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.pods.map((pod) => (
              <div key={pod.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{pod.name}</h3>
                <p className="text-brand-primary mb-3">{pod.focusArea}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Age Group: {pod.ageGroup}</p>
                  <p>Skill Level: {pod.skillLevel}</p>
                  <p>
                    Availability: {pod.maxSize - pod.participants.length} spots left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Section */}
      {clinic.resources.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-brand-primary">
                  {resource.type === 'document' ? (
                    <FileText className="w-5 h-5" />
                  ) : resource.type === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <Image className="w-5 h-5" />
                  )}
                </div>
                <span className="text-gray-700">{resource.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Coach Management Section */}
      {isCoach && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <PodManagement clinic={clinic} onClinicUpdated={onClinicUpdated} />
        </div>
      )}

      <ClinicRegistrationForm
        isOpen={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        clinic={clinic}
        onRegistrationComplete={(registration) => {
          setShowRegistrationForm(false);
          // Optionally update local state or trigger a refresh
        }}
      />
    </div>
  );
};