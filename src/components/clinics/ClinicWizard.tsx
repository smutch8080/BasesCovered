import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clinic, ClinicPod } from '../../types/clinic';
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

export const ClinicWizard: React.FC<Props> = ({ onSubmit, initialData, isLoading }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
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
    isPublished: initialData?.status === 'published' || false,
    pods: initialData?.pods || []
  });

  const steps = [
    { title: 'Basic Info', description: 'Enter clinic details' },
    { title: 'Schedule & Location', description: 'Set dates and location' },
    { title: 'Participants', description: 'Define participant criteria' },
    { title: 'Pods', description: 'Create training pods' },
    { title: 'Review', description: 'Review and publish' }
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.name.trim()) {
          alert('Please enter a clinic name');
          return false;
        }
        break;
      case 1: // Schedule & Location
        if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime || !formData.location.address) {
          alert('Please fill in all required fields');
          return false;
        }
        break;
      case 2: // Participants
        if (formData.ageGroups.length === 0 || formData.skillLevels.length === 0) {
          alert('Please select at least one age group and skill level');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

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
      description: formData.description || '', // Allow empty description
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
      pods: formData.pods,
      resources: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSubmit(clinicData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  min={formData.startDate}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <LocationAutocomplete
                value={formData.location}
                onChange={(location) => setFormData(prev => ({ ...prev, location }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Groups (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      ageGroups: prev.ageGroups.includes(group)
                        ? prev.ageGroups.filter(g => g !== group)
                        : [...prev.ageGroups, group]
                    }))}
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
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      skillLevels: prev.skillLevels.includes(level)
                        ? prev.skillLevels.filter(l => l !== level)
                        : [...prev.skillLevels, level]
                    }))}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Fee (optional)
              </label>
              <input
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Training Pods</h3>
              <p className="text-gray-600 mb-4">
                Create smaller groups focused on specific skills or areas of improvement.
              </p>

              {formData.pods.map((pod, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pod Name
                      </label>
                      <input
                        type="text"
                        value={pod.name}
                        onChange={(e) => {
                          const updatedPods = [...formData.pods];
                          updatedPods[index] = { ...pod, name: e.target.value };
                          setFormData(prev => ({ ...prev, pods: updatedPods }));
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Focus Area
                      </label>
                      <input
                        type="text"
                        value={pod.focusArea}
                        onChange={(e) => {
                          const updatedPods = [...formData.pods];
                          updatedPods[index] = { ...pod, focusArea: e.target.value };
                          setFormData(prev => ({ ...prev, pods: updatedPods }));
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Size
                      </label>
                      <input
                        type="number"
                        value={pod.maxSize}
                        onChange={(e) => {
                          const updatedPods = [...formData.pods];
                          updatedPods[index] = { ...pod, maxSize: parseInt(e.target.value) };
                          setFormData(prev => ({ ...prev, pods: updatedPods }));
                        }}
                        min="1"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updatedPods = formData.pods.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, pods: updatedPods }));
                    }}
                    className="mt-4 text-red-600 hover:text-red-700"
                  >
                    Remove Pod
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const newPod: ClinicPod = {
                    id: Math.random().toString(),
                    name: '',
                    focusArea: '',
                    ageGroup: formData.ageGroups[0] || '',
                    skillLevel: formData.skillLevels[0] || '',
                    maxSize: 10,
                    participants: []
                  };
                  setFormData(prev => ({
                    ...prev,
                    pods: [...prev.pods, newPod]
                  }));
                }}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                Add Pod
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Review & Publish</h3>
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

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Basic Information</h4>
                <p className="text-gray-600">{formData.name}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Schedule</h4>
                <p className="text-gray-600">
                  {formData.startDate} {formData.startTime} to {formData.endDate} {formData.endTime}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Location</h4>
                <p className="text-gray-600">{formData.location.address}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Participants</h4>
                <p className="text-gray-600">
                  Age Groups: {formData.ageGroups.join(', ')}
                  <br />
                  Skill Levels: {formData.skillLevels.join(', ')}
                  <br />
                  Maximum Participants: {formData.maxParticipants}
                </p>
              </div>

              {formData.pods.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700">Pods</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {formData.pods.map((pod, index) => (
                      <li key={index}>
                        {pod.name} - {pod.focusArea} (Max: {pod.maxSize})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === currentStep
                    ? 'bg-brand-primary text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div className="text-center mt-2">
                <div className="text-sm font-medium text-gray-800">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Clinic'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  );
};