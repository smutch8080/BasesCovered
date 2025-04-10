import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { TeamResource, LeagueResource } from '../../../types/resources';
import { ResourceForm } from './ResourceForm';
import { ResourceList } from './ResourceList';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  teamId: string;
  resources: TeamResource[];
  onResourceAdded: (resource: TeamResource) => void;
  onResourceUpdated: (resource: TeamResource) => void;
  onResourceDeleted: (resourceId: string) => void;
}

export const ResourcesSection: React.FC<Props> = ({
  teamId,
  resources,
  onResourceAdded,
  onResourceUpdated,
  onResourceDeleted
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<TeamResource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leagueResources, setLeagueResources] = useState<LeagueResource[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLeagueResources = async () => {
      if (!teamId) return;

      try {
        // First get the team's league ID
        const teamDoc = await getDocs(query(
          collection(db, 'teams'),
          where('__name__', '==', teamId)
        ));

        if (!teamDoc.empty) {
          const teamData = teamDoc.docs[0].data();
          const leagueId = teamData.leagueId;

          if (leagueId) {
            // Query league resources that this team can access
            const resourcesRef = collection(db, 'league_resources');
            const q = query(
              resourcesRef,
              where('leagueId', '==', leagueId),
              where('access.type', 'in', ['all', 'teams']),
              orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const loadedResources: LeagueResource[] = [];

            snapshot.forEach(doc => {
              const data = doc.data();
              // Check if resource is accessible to this team
              if (
                data.access.type === 'all' ||
                (data.access.type === 'teams' && data.access.teamIds?.includes(teamId))
              ) {
                loadedResources.push({
                  ...data,
                  id: doc.id,
                  createdAt: data.createdAt.toDate(),
                  updatedAt: data.updatedAt.toDate()
                } as LeagueResource);
              }
            });

            setLeagueResources(loadedResources);
          }
        }
      } catch (error) {
        console.error('Error loading league resources:', error);
        toast.error('Unable to load league resources');
      }
    };

    loadLeagueResources();
  }, [teamId]);

  const handleSubmit = async (data: Omit<TeamResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const now = new Date();

      if (editingResource) {
        // Update existing resource
        const resourceRef = doc(db, 'team_resources', editingResource.id);
        await updateDoc(resourceRef, {
          ...data,
          updatedAt: Timestamp.fromDate(now)
        });

        const updatedResource: TeamResource = {
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
          teamId,
          createdBy: currentUser.id,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now)
        };

        const docRef = await addDoc(collection(db, 'team_resources'), resourceData);
        
        const newResource: TeamResource = {
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
      await deleteDoc(doc(db, 'team_resources', resourceId));
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
          <h2 className="text-xl font-semibold text-gray-800">Resources</h2>
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
          <ResourceForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingResource(null);
            }}
            initialData={editingResource || undefined}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <>
          {/* Team Resources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Resources</h3>
            <ResourceList
              resources={resources}
              onEdit={(resource) => {
                setEditingResource(resource);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          </div>

          {/* League Resources */}
          {leagueResources.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">League Resources</h3>
              <ResourceList resources={leagueResources} />
            </div>
          )}
        </>
      )}
    </div>
  );
};