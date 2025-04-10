import React, { useState, useEffect } from 'react';
import { DrillAssignmentSection } from './DrillAssignmentSection';
import { PlayerSelector } from './PlayerSelector';
import { Drill } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types/team';
import toast from 'react-hot-toast';

export interface HomeworkFormData {
  title: string;
  description: string;
  dueDate: Date;
  drills: Drill[];
  teamId: string;
  playerId?: string;
}

interface Props {
  onSubmit: (data: HomeworkFormData) => Promise<void>;
  isLoading?: boolean;
}

export const HomeworkForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [drills, setDrills] = useState<Drill[]>([]);
  const [teamId, setTeamId] = useState('');
  const [playerId, setPlayerId] = useState<string>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      if (!currentUser) return;

      try {
        setIsLoadingTeams(true);
        console.log('Loading teams for user:', currentUser.id);

        const teamsRef = collection(db, 'teams');
        let teamsQuery;

        if (currentUser.role === 'admin') {
          teamsQuery = query(teamsRef);
        } else {
          teamsQuery = query(
            teamsRef,
            where('coachId', '==', currentUser.id)
          );
        }

        const querySnapshot = await getDocs(teamsQuery);
        const loadedTeams: Team[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTeams.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Team);
        });

        console.log('Loaded teams:', loadedTeams.length);
        setTeams(loadedTeams);

        // If only one team, auto-select it
        if (loadedTeams.length === 1) {
          setTeamId(loadedTeams[0].id);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Unable to load teams');
      } finally {
        setIsLoadingTeams(false);
      }
    };

    loadTeams();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || !teamId) return;

    await onSubmit({
      title,
      description,
      dueDate: new Date(dueDate),
      drills,
      teamId,
      playerId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter homework title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter homework description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Team
        </label>
        <select
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value);
            setPlayerId(undefined); // Reset player selection when team changes
          }}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">Select team...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {teamId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To (Optional)
          </label>
          <PlayerSelector
            teamId={teamId}
            onPlayerSelect={(player) => setPlayerId(player.id)}
          />
        </div>
      )}

      <DrillAssignmentSection
        drills={drills}
        onDrillsChange={setDrills}
      />

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading || isLoadingTeams}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Assigning...' : 'Assign Homework'}
        </button>
      </div>
    </form>
  );
};
