import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Event, EventType } from '../../types/events';
import { Team } from '../../types/team';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { createGameFromEvent } from '../../services/games';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export const NewEventDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const { currentUser } = useAuth();
  const [type, setType] = useState<EventType>(EventType.Practice);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCommunityEvent, setIsCommunityEvent] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [cost, setCost] = useState('');
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState('');
  const [opponent, setOpponent] = useState('');
  const [isHomeTeam, setIsHomeTeam] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      if (!isOpen || !currentUser) return;

      try {
        setIsLoading(true);
        const teamsRef = collection(db, 'teams');
        const loadedTeams = new Map<string, Team>();

        // Load teams where user is head coach
        const headCoachQuery = query(
          teamsRef,
          where('coachId', '==', currentUser.id)
        );
        const headCoachSnapshot = await getDocs(headCoachQuery);
        headCoachSnapshot.forEach(doc => {
          loadedTeams.set(doc.id, {
            ...doc.data(),
            id: doc.id
          } as Team);
        });

        // Load teams where user is assistant coach
        const assistantQuery = query(
          teamsRef,
          where('coaches', 'array-contains', currentUser.id)
        );
        const assistantSnapshot = await getDocs(assistantQuery);
        assistantSnapshot.forEach(doc => {
          if (!loadedTeams.has(doc.id)) {
            loadedTeams.set(doc.id, {
              ...doc.data(),
              id: doc.id
            } as Team);
          }
        });

        setTeams(Array.from(loadedTeams.values()));
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Unable to load teams');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [currentUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsLoading(true);
      console.log('Starting event submission...', {
        currentUser: currentUser?.id,
        type,
        title,
        teamId,
        isCommunityEvent
      });

      if (!validateForm()) {
        console.log('Form validation failed');
        return;
      }

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      // Get team details if not a community event
      let selectedTeamName: string | null = null;
      if (!isCommunityEvent && teamId) {
        const selectedTeam = teams.find(t => t.id === teamId);
        selectedTeamName = selectedTeam?.name || null;
        console.log('Selected team details:', {
          teamId,
          teamName: selectedTeamName
        });
      }

      // Create event data
      const eventData: any = {
        type,
        title: title.trim(),
        description: description.trim() || null,
        startDate: Timestamp.fromDate(startDateTime),
        endDate: Timestamp.fromDate(endDateTime),
        location: location.trim(),
        teamId: isCommunityEvent ? null : teamId,
        teamName: selectedTeamName,
        isCommunityEvent,
        createdBy: currentUser.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        cost: cost ? parseFloat(cost) : null,
        requiresPayment,
        paymentDetails: requiresPayment ? paymentDetails.trim() : null,
        rsvps: [],
        canceled: false
      };

      // Add game-specific fields only for Game events
      if (type === EventType.Game) {
        eventData.opponent = opponent.trim();
        eventData.isHomeTeam = isHomeTeam;
      }

      console.log('Event data prepared:', eventData);

      // Create event document
      console.log('Saving event to Firestore...');
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Event saved successfully with ID:', docRef.id);

      // Create event object for UI
      const newEvent: Event = {
        ...eventData,
        id: docRef.id,
        startDate: startDateTime,
        endDate: endDateTime,
        createdAt: new Date(),
        updatedAt: new Date(),
        rsvps: []
      };

      // If this is a game event, create the corresponding game record
      if (type === EventType.Game) {
        try {
          console.log('Creating corresponding game record...');
          const gameId = await createGameFromEvent(newEvent);
          console.log('Game record created successfully with ID:', gameId);
        } catch (error) {
          console.error('Error creating game record:', error);
          // Don't fail the whole operation if game creation fails
          toast.error('Event created but failed to create game record');
        }
      }

      console.log('Event creation complete:', {
        id: newEvent.id,
        title: newEvent.title,
        teamId: newEvent.teamId,
        isCommunityEvent: newEvent.isCommunityEvent
      });

      onEventCreated(newEvent);
      onClose();
      toast.success('Event created successfully');

      // Reset form
      setType(EventType.Practice);
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setLocation('');
      setTeamId('');
      setIsCommunityEvent(false);
      setMaxParticipants('');
      setCost('');
      setRequiresPayment(false);
      setPaymentDetails('');
      setOpponent('');
      setIsHomeTeam(true);
    } catch (error: any) {
      console.error('Error creating event:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack,
        eventData: {
          type,
          title,
          teamId,
          isCommunityEvent,
          startDate,
          endDate
        }
      });
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Please enter an event title');
      return false;
    }

    if (!location.trim()) {
      toast.error('Please enter an event location');
      return false;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error('Please enter event dates and times');
      return false;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return false;
    }

    if (startDateTime < new Date()) {
      toast.error('Start time must be in the future');
      return false;
    }

    if (!isCommunityEvent && !teamId) {
      toast.error('Please select a team');
      return false;
    }

    if (type === EventType.Game && !opponent.trim()) {
      toast.error('Please enter an opponent');
      return false;
    }

    return true;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 modal-container">
      <div className="fixed inset-0 bg-black/30 " aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4 modal-overlay">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl modal-content">
         <div className="modal-body">
          <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Create New Event
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  {Object.values(EventType).map((eventType) => (
                    <option key={eventType} value={eventType}>
                      {eventType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            {type === EventType.Game && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opponent
                  </label>
                  <input
                    type="text"
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Enter opponent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Game Location
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={isHomeTeam}
                        onChange={() => setIsHomeTeam(true)}
                        className="text-brand-primary focus:ring-brand-primary dark:bg-gray-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Home Game</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!isHomeTeam}
                        onChange={() => setIsHomeTeam(false)}
                        className="text-brand-primary focus:ring-brand-primary dark:bg-gray-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Away Game</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isCommunityEvent}
                  onChange={(e) => {
                    setIsCommunityEvent(e.target.checked);
                    if (e.target.checked) {
                      setTeamId('');
                    }
                  }}
                  className="rounded text-brand-primary focus:ring-brand-primary dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  This is a community event (open to everyone)
                </span>
              </label>
            </div>

            {!isCommunityEvent && teams.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Team
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  required={!isCommunityEvent}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Participants (optional)
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost (optional)
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            {cost && (
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={requiresPayment}
                    onChange={(e) => setRequiresPayment(e.target.checked)}
                    className="rounded text-brand-primary focus:ring-brand-primary dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Payment required for registration
                  </span>
                </label>

                {requiresPayment && (
                  <textarea
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Enter payment instructions or details..."
                    className="mt-2 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    rows={2}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
         </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};