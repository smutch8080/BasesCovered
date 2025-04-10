import React from 'react';
import { Calendar, Clock, MapPin, User, Trash2 } from 'lucide-react';
import { SavedPracticePlan } from '../types';

interface Props {
  plan: SavedPracticePlan;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const SavedPlanCard: React.FC<Props> = ({ 
  plan, 
  onView, 
  onEdit, 
  onDuplicate,
  onDelete 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      plan.playerId ? 'border-l-4 border-brand-primary' : ''
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
            {plan.playerName && (
              <div className="flex items-center gap-2 text-brand-primary mt-1">
                <User className="w-4 h-4" />
                <span>Player Plan: {plan.playerName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(plan.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{plan.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{plan.location || 'No location set'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {plan.drills.length} drills
          </span>
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Edit
            </button>
            <button
              onClick={onDuplicate}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Duplicate
            </button>
            <button
              onClick={onView}
              className="px-3 py-1 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              View Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};