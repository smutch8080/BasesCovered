import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { LeagueResource } from '../../../types/resources';
import { Team } from '../../../types/team';
import { LeagueResourceForm } from './LeagueResourceForm';
import { LeagueResourcesList } from './LeagueResourcesList';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  leagueId: string;
  resources: LeagueResource[];
  teams: Team[];
  onResourceAdded: (resource: LeagueResource) => void;
  onResourceUpdated: (resource: LeagueResource) => void;
  onResourceDeleted: (resourceId: string) => void;
}

export const LeagueResourcesSection: React.FC<Props> = ({
  leagueId,
  resources,
  teams,
  onResourceAdded,
  onResourceUpdated,
  onResourceDeleted
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<LeagueResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (data: Omit<LeagueResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const now = new Date();

      if (editingResource) {
        // Update existing resource
        const resourceRef = doc(db, 'league_resources', editingResource.id);
        await updateDoc(resourceRef, {
          ...data,
          updatedAt: Timestamp.fromDate(now)
        });

        const updatedResource: LeagueResource = {
          ...editingResource,
          ...data,
          updatedAt: now
        };

        onResourceUpdated(updatedResource);
        toast.success('Resource updated successfully');
      } else {
        // Create new resource
        const resourceData = {
          ...data,
          leagueId,
          createdBy: currentUser.id,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now)
        };

        const docRef = await addDoc(collection(db, 'league_resources'), resourceData);
        
        const newResource: LeagueResource = {
          ...resourceData,
          id: docRef.id,
          createdAt: now,
          updatedAt: now
        };

        onResourceAdded(newResource);
        toast.success('Resource added successfully');
      }

      setShowForm(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await deleteDoc(doc(db, 'league_resources', resourceId));
      onResourceDeleted(resourceId);
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-primary" />
          <h2 className="text-xl font-semibold text-gray-800">League Resources</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h3>
          <LeagueResourceForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingResource(null);
            }}
            teams={teams}
            initialData={editingResource || undefined}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <LeagueResourcesList
          resources={resources}
          teams={teams}
          onEdit={(resource) => {
            setEditingResource(resource);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};