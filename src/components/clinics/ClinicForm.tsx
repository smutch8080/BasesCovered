import React, { useState } from 'react';
import { Clinic } from '../../types/clinic';
import { useAuth } from '../../contexts/AuthContext';
import { LocationAutocomplete } from '../teams/LocationAutocomplete';
import { RichTextEditor } from '../editor/RichTextEditor';
import { Switch } from '@headlessui/react';

interface Props {
  onSubmit: (clinic: Omit<Clinic, 'id'>) => void;
  initialData?: Partial<Clinic>;
  isLoading?: boolean;
}

const AGE_GROUPS = ['8U', '10U', '12U', '14U', '16U', '18U'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const ClinicForm: React.FC<Props> = ({ onSubmit, initialData, isLoading }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    startTime: initialData?.startDate ? new Date(initialData.startDate).toTimeString().slice(0, 5) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    endTime: initialData?.endDate ? new Date(initialData.endDate).toTimeString().slice(0, 5) : '',
    location: initialData?.location || { address: '', placeId: '' },
    ageGroups: initialData?.ageGroup?.split(',') || [],
    skillLevels: initialData?.skillLevel?.split(',') || [],
    maxParticipants: initialData?.maxParticipants || 20,
    fee: initialData?.fee || 0,
    contactEmail: initialData?.contactEmail || currentUser?.email || '',
    contactPhone: initialData?.contactPhone || '',
    isPublished: initialData?.status === 'published' || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a clinic name');
      return;
    }

    if (!formData.location.address || !formData.location.placeId) {
      alert('Please select a valid location');
      return;
    }

    if (formData.ageGroups.length === 0) {
      alert('Please select at least one age group');
      return;
    }

    if (formData.skillLevels.length === 0) {
      alert('Please select at least one skill level');
      return;
    }

    // Create date objects
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    // Validate dates
    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }

    const clinicData: Omit<Clinic, 'id'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      startDate: startDateTime,
      endDate: endDateTime,
      location: {
        address: formData.location.address,
        placeId: formData.location.placeId
      },
      ageGroup: formData.ageGroups.join(','),
      skillLevel: formData.skillLevels.join(','),
      maxParticipants: formData.maxParticipants,
      currentParticipants: 0,
      fee: formData.fee || undefined,
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone?.trim() || undefined,
      createdBy: currentUser.id,
      status: formData.isPublished ? 'published' : 'draft',
      pods: [],
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSubmit(clinicData);
  };

  const toggleAgeGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(group)
        ? prev.ageGroups.filter(g => g !== group)
        : [...prev.ageGroups, group]
    }));
  };

  const toggleSkillLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      skillLevels: prev.skillLevels.includes(level)
        ? prev.skillLevels.filter(l => l !== level)
        : [...prev.skillLevels, level]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Clinic Details</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${formData.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
            {formData.isPublished ? 'Published' : 'Draft'}
          </span>
          <Switch
            checked={formData.isPublished}
            onChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
            className={`${
              formData.isPublished ? 'bg-green-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
          >
            <span
              className={`${
                formData.isPublished ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clinic Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter clinic name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          height={200}
        />
      </div>

      {/* Rest of the form fields remain the same until age groups and skill levels */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age Groups (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => toggleAgeGroup(group)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                formData.ageGroups.includes(group)
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skill Levels (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => toggleSkillLevel(level)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                formData.skillLevels.includes(level)
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Rest of the form fields remain the same */}

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Clinic'}
        </button>
      </div>
    </form>
  );
};