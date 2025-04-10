import React, { useState } from 'react';
import { Users, Plus, HandHelping, Clock } from 'lucide-react';
import { VolunteerSlot, VolunteerRole } from '../../types/volunteer';
import { useAuth } from '../../contexts/AuthContext';
import { EventVolunteerSetup } from './EventVolunteerSetup';
import toast from 'react-hot-toast';

interface Props {
  eventId: string;
  slots: VolunteerSlot[];
  roles: VolunteerRole[];
  onSlotUpdate: (updatedSlot: VolunteerSlot) => void;
  onAddSlot: (slot: Omit<VolunteerSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onRemoveSlot: (slotId: string) => void;
  isEditable?: boolean;
  eventStartTime: Date;
  eventEndTime: Date;
}

export const EventVolunteerSection: React.FC<Props> = ({
  eventId,
  slots,
  roles,
  onSlotUpdate,
  onAddSlot,
  onRemoveSlot,
  isEditable = false,
  eventStartTime,
  eventEndTime
}) => {
  const { currentUser } = useAuth();
  const [showSetup, setShowSetup] = useState(false);

  const handleVolunteerSignup = async (slotId: string) => {
    if (!currentUser) {
      toast.error('Please sign in to volunteer');
      return;
    }

    try {
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return;

      if (slot.assignedVolunteerId) {
        toast.error('This slot is already filled');
        return;
      }

      const updatedSlot: VolunteerSlot = {
        ...slot,
        assignedVolunteerId: currentUser.id,
        assignedVolunteerName: currentUser.displayName,
        status: 'filled',
        updatedAt: new Date()
      };

      onSlotUpdate(updatedSlot);
      toast.success('Successfully signed up for volunteer role');
    } catch (error) {
      console.error('Error signing up for volunteer slot:', error);
      toast.error('Failed to sign up for volunteer role');
    }
  };

  const handleCancelSignup = async (slotId: string) => {
    try {
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return;

      const updatedSlot: VolunteerSlot = {
        ...slot,
        assignedVolunteerId: undefined,
        assignedVolunteerName: undefined,
        status: 'open',
        updatedAt: new Date()
      };

      onSlotUpdate(updatedSlot);
      toast.success('Successfully cancelled volunteer signup');
    } catch (error) {
      console.error('Error cancelling volunteer signup:', error);
      toast.error('Failed to cancel signup');
    }
  };

  // Group slots by role
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.roleId]) {
      acc[slot.roleId] = [];
    }
    acc[slot.roleId].push(slot);
    return acc;
  }, {} as Record<string, VolunteerSlot[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HandHelping className="w-5 h-5 text-brand-primary" />
          <h2 className="text-xl font-semibold text-gray-800">Volunteer Needs</h2>
        </div>
        {isEditable && (
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/5 rounded-lg"
          >
            {showSetup ? 'Hide Setup' : (
              <>
                <Plus className="w-4 h-4" />
                Add Slots
              </>
            )}
          </button>
        )}
      </div>

      {isEditable && showSetup && (
        <EventVolunteerSetup
          eventId={eventId}
          roles={roles}
          onAddSlot={onAddSlot}
          onRemoveSlot={onRemoveSlot}
          existingSlots={slots}
          eventStartTime={eventStartTime}
          eventEndTime={eventEndTime}
        />
      )}

      {Object.entries(groupedSlots).map(([roleId, roleSlots]) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return null;
        
        return (
          <div key={roleId} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-800">{role.name}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
              <span className="text-sm text-gray-600">
                {roleSlots.filter(s => s.status === 'open').length} of {roleSlots.length} slots available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleSlots.map((slot) => (
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
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {slot.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - 
                          {slot.endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      {slot.assignedVolunteerName && (
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          {slot.assignedVolunteerName}
                        </p>
                      )}
                    </div>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>

                  {slot.notes && (
                    <p className="text-sm text-gray-600 mb-4">{slot.notes}</p>
                  )}

                  {!slot.assignedVolunteerId ? (
                    <button
                      onClick={() => handleVolunteerSignup(slot.id)}
                      className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg
                        hover:opacity-90 transition-colors text-sm"
                    >
                      Volunteer
                    </button>
                  ) : slot.assignedVolunteerId === currentUser?.id && (
                    <button
                      onClick={() => handleCancelSignup(slot.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg
                        hover:opacity-90 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {slots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No volunteer roles needed for this event
        </div>
      )}
    </div>
  );
};