import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DrillCategory } from '../../types';
import { useStore } from '../../store';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDrillCreated?: (drill: any) => void;
}

export const NewCustomDrillDialog: React.FC<Props> = ({ isOpen, onClose, onDrillCreated }) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [whatToLookFor, setWhatToLookFor] = useState('');
  const [category, setCategory] = useState<DrillCategory | ''>('');
  const [duration, setDuration] = useState(15);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setIsLoading(true);

      const drillData = {
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        whatToLookFor: whatToLookFor.trim(),
        category,
        duration,
        equipment,
        experienceLevel: 'Intermediate',
        votes: 0,
        comments: [],
        resources: [],
        isCustom: true,
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'drills'), drillData);
      
      const newDrill = {
        ...drillData,
        id: docRef.id
      };

      if (onDrillCreated) {
        onDrillCreated(newDrill);
      }

      toast.success('Custom drill created successfully');
      onClose();

      // Reset form
      setName('');
      setShortDescription('');
      setDescription('');
      setWhatToLookFor('');
      setCategory('');
      setDuration(15);
      setEquipment([]);
      setNewEquipment('');
    } catch (error) {
      console.error('Error creating custom drill:', error);
      toast.error('Failed to create custom drill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full">
            <div className="px-6 py-4 border-b">
              <Dialog.Title className="text-xl font-bold">
                Add Custom Drill
              </Dialog.Title>
            </div>

            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form id="customDrillForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DrillCategory)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">Select category...</option>
                    {Object.values(DrillCategory).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drill Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    placeholder="Enter drill name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    placeholder="Brief description of the drill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    placeholder="Detailed description of how to run the drill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What to Look For
                  </label>
                  <textarea
                    value={whatToLookFor}
                    onChange={(e) => setWhatToLookFor(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    placeholder="What coaches should observe during this drill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                    min="5"
                    max="60"
                    step="5"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Needed
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      placeholder="Add equipment..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEquipment();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddEquipment}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {equipment.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="customDrillForm"
                  disabled={isLoading}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Drill'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};