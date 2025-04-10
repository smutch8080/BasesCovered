import React from 'react';
import { Game } from '../../types/game';
import { Event } from '../../types/events';
import { Users, CheckCircle, Clock } from 'lucide-react';

interface Props {
  game: Game;
  event: Event | null;
  onGameUpdated: (game: Game) => void;
  isCoach: boolean;
}

export const GameVolunteers: React.FC<Props> = ({
  game,
  event,
  onGameUpdated,
  isCoach
}) => {
  const filledSlots = game.volunteerSlots.filter(slot => slot.status === 'filled');
  const openSlots = game.volunteerSlots.filter(slot => slot.status === 'open');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Volunteer Positions</h3>
        {isCoach && (
          <button
            onClick={() => {/* TODO: Implement manage roles */}}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
          >
            <Users className="w-4 h-4" />
            Manage Roles
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Filled Positions */}
        <div>
          <h4 className="text-md font-medium text-green-600 dark:text-green-500 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Filled Positions ({filledSlots.length})
          </h4>
          <div className="space-y-3">
            {filledSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200">{slot.roleName}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {slot.assignedVolunteerName}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h4 className="text-md font-medium text-yellow-600 dark:text-yellow-500 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Open Positions ({openSlots.length})
          </h4>
          <div className="space-y-3">
            {openSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200">{slot.roleName}</h5>
                    {slot.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{slot.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {/* TODO: Implement volunteer signup */}}
                    className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:opacity-90"
                  >
                    Volunteer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};