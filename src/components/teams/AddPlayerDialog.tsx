import { useState } from 'react';
import { Team, Player } from '../../types/team';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AddPlayerDialogProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onPlayerAdded?: (player: Player) => void;
  onTeamUpdated?: (team: Team) => void;
}

const POSITIONS = [
  'Pitcher',
  'Catcher',
  'First Base',
  'Second Base',
  'Third Base',
  'Short Stop',
  'Left Field',
  'Center Field',
  'Right Field',
  'Designated Hitter'
] as const;

export default function AddPlayerDialog({
  team,
  isOpen,
  onClose,
  onPlayerAdded,
  onTeamUpdated,
}: AddPlayerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    positions: [] as string[],
    jerseyNumber: '',
    age: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Email validation only if provided
    if (formData.email.trim() && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Age validation if provided
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0)) {
      newErrors.age = 'Please enter a valid age';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const position = value;
      setFormData(prev => ({
        ...prev,
        positions: checked 
          ? [...prev.positions, position]
          : prev.positions.filter(p => p !== position)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!team || !team.id) {
      toast.error('Team information is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Adding player...'); // Debug log

      const playerData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email.toLowerCase() || null,
        jerseyNumber: formData.jerseyNumber || '',
        positions: formData.positions,
        age: formData.age ? parseInt(formData.age) : 0,
      };

      const functions = getFunctions();
      const addPlayerToTeam = httpsCallable(functions, 'addPlayerToTeam');
      
      const result = await addPlayerToTeam({
        teamId: team.id,
        playerData
      });
      
      console.log('Player added, processing response...'); // Debug log
      const response = result.data as { 
        success: boolean; 
        playerId: string;
        isNewUser: boolean;
        playerExists: boolean;
        message?: string 
      };
      
      if (response.success) {
        console.log('Success, updating team...'); // Debug log
        
        // Create player object from the data we have
        const newPlayer: Player = {
          id: response.playerId,
          ...playerData
        };
        
        // First update the team data
        const updatedTeam = {
          ...team,
          players: [...(team.players || []), newPlayer]
        };
        
        // Then call the update handlers
        try {
          if (onTeamUpdated) {
            await onTeamUpdated(updatedTeam);
          }
          
          if (onPlayerAdded) {
            await onPlayerAdded(newPlayer);
          }
          
          toast.success(`${formData.firstName} ${formData.lastName} added to team`);
          
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            positions: [],
            jerseyNumber: '',
            age: '',
          });
          setErrors({});
          
          // Force close the dialog
          console.log('Closing dialog...'); // Debug log
          onClose();
          return; // Ensure we exit after closing
        } catch (updateError) {
          console.error('Error updating team:', updateError);
          toast.error('Player added but team update failed. Please refresh the page.');
        }
      } else {
        console.log('Response not successful:', response); // Debug log
        toast.error(response.message || 'Failed to add player');
      }
    } catch (error: any) {
      console.error('Error adding player:', error);
      
      if (error.code === 'functions/already-exists') {
        toast.error('A player with this email already exists in this team');
      } else if (error.code === 'functions/permission-denied') {
        toast.error('You do not have permission to add players to this team');
      } else {
        toast.error('Failed to add player. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            Add New Player
          </Dialog.Title>
          <p className="text-gray-600 mb-4">Add a new player to the team roster.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  error={errors.firstName}
                />
              </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
              </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey #
              </label>
                <Input
                  id="jerseyNumber"
                  name="jerseyNumber"
                  value={formData.jerseyNumber}
                  onChange={handleChange}
                  placeholder="Jersey number"
                  error={errors.jerseyNumber}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
              </label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Player age"
                  error={errors.age}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="player@example.com"
                error={errors.email}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Positions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POSITIONS.map((position) => (
                  <label key={position} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="positions"
                      value={position}
                      checked={formData.positions.includes(position)}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{position}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    positions: [],
                    jerseyNumber: '',
                    age: '',
                  });
                  setErrors({});
                  onClose();
                }}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? 'Adding...' : 'Add Player'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}