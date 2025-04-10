import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team, AgeDivision, TeamType, Location } from '../../types/team';
import { LocationAutocomplete } from './LocationAutocomplete';
import { LeagueSelector } from './LeagueSelector';
import { TeamLogoUpload } from './TeamLogoUpload';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onTeamUpdated: (team: Team) => void;
}

const defaultLocation: Location = {
  city: '',
  state: '',
  country: '',
  placeId: ''
};

export const EditTeamDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  team,
  onTeamUpdated
}) => {
  const [name, setName] = useState(team.name);
  const [location, setLocation] = useState<Location>(team.location || defaultLocation);
  const [ageDivision, setAgeDivision] = useState<AgeDivision>(team.ageDivision);
  const [type, setType] = useState<TeamType>(team.type);
  const [logoUrl, setLogoUrl] = useState(team.logoUrl || '');
  const [leagueId, setLeagueId] = useState(team.leagueId || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updateData = {
        name: name.trim(),
        location,
        ageDivision,
        type,
        logoUrl,
        leagueId: leagueId || null,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'teams', team.id), updateData);
      
      const updatedTeam: Team = {
        ...team,
        ...updateData
      };

      onTeamUpdated(updatedTeam);
      onClose();
      toast.success('Team updated successfully');
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Edit Team
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
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};