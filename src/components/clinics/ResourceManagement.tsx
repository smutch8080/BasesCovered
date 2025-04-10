import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clinic } from '../../types/clinic';
import { FileText, Video, Image, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  clinic: Clinic;
  onClinicUpdated: (clinic: Clinic) => void;
}

export const ResourceManagement: React.FC<Props> = ({ clinic, onClinicUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newResource, setNewResource] = useState({
    type: 'document' as const,
    name: '',
    url: '',
    podId: ''
  });

  const handleAddResource = async () => {
    if (!newResource.name || !newResource.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const resourceId = Math.random().toString();
      const updatedResources = [
        ...clinic.resources,
        {
          id: resourceId,
          ...newResource
        }
      ];

      const clinicRef = doc(db, 'clinics', clinic.id);
      await updateDoc(clinicRef, {
        resources: updatedResources,
        updatedAt: new Date()
      });

      onClinicUpdated({
        ...clinic,
        resources: updatedResources,
        updatedAt: new Date()
      });

      setNewResource({
        type: 'document',
        name: '',
        url: '',
        podId: ''
      });

      toast.success('Resource added successfully');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    try {
      setIsLoading(true);
      const updatedResources = clinic.resources.filter(r => r.id !== resourceId);

      const clinicRef = doc(db, 'clinics', clinic.id);
      await updateDoc(clinicRef, {
        resources: updatedResources,
        updatedAt: new Date()
      });

      onClinicUpdated({
        ...clinic,
        resources: updatedResources,
        updatedAt: new Date()
      });

      toast.success('Resource removed successfully');
    } catch (error) {
      console.error('Error removing resource:', error);
      toast.error('Failed to remove resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Resources</h2>
        <button
          onClick={handleAddResource}
          disabled={isLoading || !newResource.name || !newResource.url}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            value={newResource.type}
            onChange={(e) => setNewResource(prev => ({
              ...prev,
              type: e.target.value as 'document' | 'video' | 'image'
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Name
          </label>
          <input
            type="text"
            value={newResource.name}
            onChange={(e) => setNewResource(prev => ({
              ...prev,
              name: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter resource name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource URL
          </label>
          <input
            type="url"
            value={newResource.url}
            onChange={(e) => setNewResource(prev => ({
              ...prev,
              url: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter resource URL"
          />
        </div>

        {clinic.pods.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Pod (Optional)
            </label>
            <select
              value={newResource.podId}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                podId: e.target.value
              }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">Available to all pods</option>
              {clinic.pods.map((pod) => (
                <option key={pod.id} value={pod.id}>{pod.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {clinic.resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {resource.type === 'document' ? (
                <FileText className="w-5 h-5 text-brand-primary" />
              ) : resource.type === 'video' ? (
                <Video className="w-5 h-5 text-brand-primary" />
              ) : (
                <Image className="w-5 h-5 text-brand-primary" />
              )}
              <div>
                <h4 className="font-medium text-gray-800">{resource.name}</h4>
                {resource.podId && (
                  <p className="text-sm text-brand-primary">
                    {clinic.pods.find(p => p.id === resource.podId)?.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:opacity-90"
              >
                View
              </a>
              <button
                onClick={() => handleRemoveResource(resource.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {clinic.resources.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No resources added yet
          </p>
        )}
      </div>
    </div>
  );
};