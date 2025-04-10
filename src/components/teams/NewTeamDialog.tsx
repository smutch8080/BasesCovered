import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Team, AgeDivision, TeamType, Location } from '../../types/team';
import { LocationAutocomplete } from './LocationAutocomplete';
import { LeagueSelector } from './LeagueSelector';
import { TeamLogoUpload } from './TeamLogoUpload';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

const defaultLocation: Location = {
  city: '',
  state: '',
  country: 'USA',
  placeId: ''
};

export const NewTeamDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onTeamCreated
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<Location>(defaultLocation);
  const [ageDivision, setAgeDivision] = useState<AgeDivision>(AgeDivision['10U']);
  const [type, setType] = useState<TeamType>(TeamType.Recreation);
  const [logoUrl, setLogoUrl] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const teamData = {
        name: name.trim(),
        location,
        ageDivision,
        type,
        logoUrl,
        leagueId: leagueId || null,
        players: [],
        coachId: currentUser.id,
        coaches: [],
        parents: [],
        joinRequests: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'teams'), teamData);
      
      const newTeam: Team = {
        ...teamData,
        id: docRef.id,
        players: [],
        coaches: [],
        parents: [],
        joinRequests: [],
        createdAt: teamData.createdAt.toDate(),
        updatedAt: teamData.updatedAt.toDate()
      };

      onTeamCreated(newTeam);
      onClose();
      toast.success('Team created successfully');
      
      // Reset form
      setName('');
      setLocation(defaultLocation);
      setAgeDivision(AgeDivision['10U']);
      setType(TeamType.Recreation);
      setLogoUrl('');
      setLeagueId('');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Create New Team
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Team Logo
              </label>
              <TeamLogoUpload
                currentLogo={logoUrl}
                onChange={setLogoUrl}
                size="md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                League
              </label>
              <LeagueSelector
                value={leagueId}
                onChange={setLeagueId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Division
              </label>
              <select
                value={ageDivision}
                onChange={(e) => setAgeDivision(e.target.value as AgeDivision)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                {Object.values(AgeDivision).map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TeamType)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                {Object.values(TeamType).map((teamType) => (
                  <option key={teamType} value={teamType}>
                    {teamType}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                Create Team
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};