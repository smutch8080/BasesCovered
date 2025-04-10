import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Clinic } from '../../types/clinic';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface Props {
  clinic: Clinic;
}

export const ClinicCard: React.FC<Props> = ({ clinic }) => {
  const spotsLeft = clinic.maxParticipants - clinic.currentParticipants;
  const isMultiDay = clinic.startDate.toDateString() !== clinic.endDate.toDateString();

  return (
    <Link
      to={`/clinics/${clinic.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{clinic.name}</h3>
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
            <div className="flex items-center gap-1 text-brand-primary font-semibold">
              <DollarSign className="w-4 h-4" />
              {clinic.fee}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
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
        </div>

        {clinic.pods.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Pods:</h4>
            <div className="flex flex-wrap gap-2">
              {clinic.pods.map((pod) => (
                <span
                  key={pod.id}
                  className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                >
                  {pod.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm">
              {clinic.ageGroup}
            </span>
            <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm">
              {clinic.skillLevel}
            </span>
          </div>
          <span className="text-brand-primary font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  );
};