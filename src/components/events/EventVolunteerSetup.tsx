import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { VolunteerRole, VolunteerSlot } from '../../types/volunteer';
import toast from 'react-hot-toast';

interface Props {
  eventId: string;
  roles: VolunteerRole[];
  onAddSlot: (slot: Omit<VolunteerSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onRemoveSlot: (slotId: string) => void;
  existingSlots?: VolunteerSlot[];
  eventStartTime: Date;
  eventEndTime: Date;
}

export const EventVolunteerSetup: React.FC<Props> = ({
  eventId,
  roles,
  onAddSlot,
  onRemoveSlot,
  existingSlots = [],
  eventStartTime,
  eventEndTime
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startTime, setStartTime] = useState(
    eventStartTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [endTime, setEndTime] = useState(
    eventEndTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );

  const handleAddSlot = () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    const role = roles.find(r => r.id === selectedRole);
    if (!role) {
      toast.error('Selected role not found');
      return;
    }

    try {
      // Create start and end date objects
      const startDate = new Date(eventStartTime);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDate.setHours(startHours || 0, startMinutes || 0, 0, 0);

      const endDate = new Date(eventEndTime);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDate.setHours(endHours || 0, endMinutes || 0, 0, 0);

      // Validate times
      if (startDate >= endDate) {
        toast.error('End time must be after start time');
        return;
      }

      if (startDate < eventStartTime || endDate > eventEndTime) {
        toast.error('Volunteer times must be within event times');
        return;
      }

      // Add multiple slots if quantity > 1
      for (let i = 0; i < quantity; i++) {
        // Create slot data without unnecessary fields
        const slotData: Omit<VolunteerSlot, 'id' | 'createdAt' | 'updatedAt'> = {
          roleId: selectedRole,
          roleName: role.name,
          eventId,
          startTime: startDate,
          endTime: endDate,
          status: 'open'
        };

        // Only add notes if provided
        if (notes.trim()) {
          slotData.notes = notes.trim();
        }

        onAddSlot(slotData);
      }

      // Reset form
      setSelectedRole('');
      setNotes('');
      setQuantity(1);
      toast.success('Volunteer slots added successfully');
    } catch (error) {
      console.error('Error creating volunteer slots:', error);
      toast.error('Failed to create volunteer slots');
    }
  };

  // Group existing slots by role
  const groupedSlots = existingSlots.reduce((acc, slot) => {
    if (!acc[slot.roleId]) {
      acc[slot.roleId] = [];
    }
    acc[slot.roleId].push(slot);
    return acc;
  }, {} as Record<string, VolunteerSlot[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Volunteer Slots</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">Select role...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Any special instructions or requirements..."
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleAddSlot}
            disabled={!selectedRole}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Slots
          </button>
        </div>
      </div>

      {/* Existing Slots */}
      {Object.entries(groupedSlots).map(([roleId, slots]) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return null;

        return (
          <div key={roleId} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-800">{role.name}</h4>
                {slots[0].notes && (
                  <p className="text-sm text-gray-600 mt-2">{slots[0].notes}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {slots[0].startTime.toLocaleTimeString()} - {slots[0].endTime.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {slots.length} slot{slots.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => slots.forEach(s => onRemoveSlot(s.id))}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};