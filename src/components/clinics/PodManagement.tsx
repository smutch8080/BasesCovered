import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Clinic, ClinicPod } from '../../types/clinic';
import { Users, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  clinic: Clinic;
  onClinicUpdated: (clinic: Clinic) => void;
}

export const PodManagement: React.FC<Props> = ({ clinic, onClinicUpdated }) => {
  const [editingPod, setEditingPod] = useState<ClinicPod | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePod = async (podId: string, updates: Partial<ClinicPod>) => {
    try {
      setIsLoading(true);
      const updatedPods = clinic.pods.map(pod =>
        pod.id === podId ? { ...pod, ...updates } : pod
      );

      const clinicRef = doc(db, 'clinics', clinic.id);
      await updateDoc(clinicRef, {
        pods: updatedPods,
        updatedAt: new Date()
      });

      onClinicUpdated({
        ...clinic,
        pods: updatedPods,
        updatedAt: new Date()
      });

      setEditingPod(null);
      toast.success('Pod updated successfully');
    } catch (error) {
      console.error('Error updating pod:', error);
      toast.error('Failed to update pod');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePod = async (podId: string) => {
    if (!confirm('Are you sure you want to delete this pod?')) return;

    try {
      setIsLoading(true);
      const updatedPods = clinic.pods.filter(pod => pod.id !== podId);

      const clinicRef = doc(db, 'clinics', clinic.id);
      await updateDoc(clinicRef, {
        pods: updatedPods,
        updatedAt: new Date()
      });

      onClinicUpdated({
        ...clinic,
        pods: updatedPods,
        updatedAt: new Date()
      });

      toast.success('Pod deleted successfully');
    } catch (error) {
      console.error('Error deleting pod:', error);
      toast.error('Failed to delete pod');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-800">Pod Management</h2>
        </div>
        <button
          onClick={() => setEditingPod({
            id: Math.random().toString(),
            name: '',
            focusArea: '',
            ageGroup: clinic.ageGroup,
            skillLevel: clinic.skillLevel,
            maxSize: 10,
            participants: []
          })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Pod
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinic.pods.map((pod) => (
          <div key={pod.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{pod.name}</h3>
                <p className="text-sm text-brand-primary">{pod.focusArea}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPod(pod)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePod(pod.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>Age Group: {pod.ageGroup}</p>
              <p>Skill Level: {pod.skillLevel}</p>
              <p>Maximum Size: {pod.maxSize}</p>
              <p>Current Participants: {pod.participants.length}</p>
            </div>

            {pod.schedule && pod.schedule.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-700 mb-2">Schedule</h4>
                <div className="space-y-1">
                  {pod.schedule.map((slot, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {new Date(slot.startTime).toLocaleTimeString()} - 
                      {new Date(slot.endTime).toLocaleTimeString()}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingPod && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingPod.id ? 'Edit Pod' : 'Add Pod'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pod Name
                </label>
                <input
                  type="text"
                  value={editingPod.name}
                  onChange={(e) => setEditingPod(prev => prev ? {
                    ...prev,
                    name: e.target.value
                  } : null)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Area
                </label>
                <input
                  type="text"
                  value={editingPod.focusArea}
                  onChange={(e) => setEditingPod(prev => prev ? {
                    ...prev,
                    focusArea: e.target.value
                  } : null)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Size
                </label>
                <input
                  type="number"
                  value={editingPod.maxSize}
                  onChange={(e) => setEditingPod(prev => prev ? {
                    ...prev,
                    maxSize: parseInt(e.target.value)
                  } : null)}
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setEditingPod(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingPod.id) {
                    handleUpdatePod(editingPod.id, editingPod);
                  } else {
                    handleUpdatePod(Math.random().toString(), editingPod);
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Pod'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};