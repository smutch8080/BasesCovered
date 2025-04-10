import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { VolunteerRole } from '../../types/volunteer';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: VolunteerRole;
}

export const VolunteerRoleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData?.requiredSkills || []);
  const [minAge, setMinAge] = useState(initialData?.minAge || 0);
  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      description: description.trim(),
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
      minAge: minAge > 0 ? minAge : undefined,
      isActive: true
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            {initialData ? 'Edit Volunteer Role' : 'New Volunteer Role'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="e.g., Scorekeeper"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Describe the responsibilities..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Add a required skill..."
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-1 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Age
              </label>
              <input
                type="number"
                value={minAge || ''}
                onChange={(e) => setMinAge(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Leave blank if no minimum"
              />
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
                {initialData ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};