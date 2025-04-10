import React from 'react';
import { Clock, Users, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import { VolunteerSlot } from '../../types/volunteer';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

interface Props {
  slots: VolunteerSlot[];
  onVolunteer: (slotId: string) => Promise<void>;
  onCancelVolunteer: (slotId: string) => Promise<void>;
}

export const VolunteerSlotsList: React.FC<Props> = ({
  slots,
  onVolunteer,
  onCancelVolunteer
}) => {
  const { currentUser } = useAuth();

  const handleVolunteer = async (slotId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to volunteer');
      return;
    }
    await onVolunteer(slotId);
  };

  // Group slots by event
  const slotsByEvent = slots.reduce((acc, slot) => {
    if (!acc[slot.eventId]) {
      acc[slot.eventId] = [];
    }
    acc[slot.eventId].push(slot);
    return acc;
  }, {} as Record<string, VolunteerSlot[]>);

  if (Object.keys(slotsByEvent).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No volunteer opportunities available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(slotsByEvent).map(([eventId, eventSlots]) => (
        <div key={eventId} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Header */}
          <div className="bg-gray-50 border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {eventSlots[0].eventName}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(eventSlots[0].startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {eventSlots[0].startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - 
                  {eventSlots[0].endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              {eventSlots[0].location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{eventSlots[0].location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Slots */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border ${
                    slot.status === 'filled'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{slot.roleName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {slot.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - 
                          {slot.endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {slot.status === 'filled' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Users className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {slot.notes && (
                    <p className="text-sm text-gray-600 mb-3">{slot.notes}</p>
                  )}

                  {slot.assignedVolunteerId === currentUser?.id ? (
                    <button
                      onClick={() => onCancelVolunteer(slot.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg
                        hover:bg-red-700 transition-colors text-sm"
                    >
                      Cancel Signup
                    </button>
                  ) : slot.status === 'open' ? (
                    <button
                      onClick={() => handleVolunteer(slot.id)}
                      className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg
                        hover:opacity-90 transition-colors text-sm"
                    >
                      Volunteer
                    </button>
                  ) : (
                    <div className="text-sm text-gray-600 mt-2">
                      Filled by: {slot.assignedVolunteerName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};