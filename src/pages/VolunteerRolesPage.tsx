import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { VolunteerRole } from '../types/volunteer';
import { VolunteerRolesList } from '../components/volunteers/VolunteerRolesList';
import { VolunteerRoleModal } from '../components/volunteers/VolunteerRoleModal';
import { fetchVolunteerRoles, createVolunteerRole, updateVolunteerRole, deleteVolunteerRole } from '../services/volunteers';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function VolunteerRolesPage() {
  const { teamId } = useParams();
  const [roles, setRoles] = useState<VolunteerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<VolunteerRole | null>(null);

  useEffect(() => {
    if (teamId) {
      loadRoles();
    }
  }, [teamId]);

  const loadRoles = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      const loadedRoles = await fetchVolunteerRoles(teamId);
      setRoles(loadedRoles);
    } catch (error) {
      console.error('Error loading volunteer roles:', error);
      toast.error('Unable to load volunteer roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRole = async (roleData: Omit<VolunteerRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!teamId) {
      toast.error('Team ID is required');
      return;
    }

    try {
      if (editingRole) {
        await updateVolunteerRole(editingRole.id, roleData);
        toast.success('Role updated successfully');
      } else {
        await createVolunteerRole(teamId, roleData);
        toast.success('Role created successfully');
      }
      
      await loadRoles();
      setShowRoleModal(false);
      setEditingRole(null);
    } catch (error: any) {
      console.error('Error saving volunteer role:', error);
      toast.error(error.message || 'Failed to save volunteer role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      await deleteVolunteerRole(roleId);
      toast.success('Role deleted successfully');
      await loadRoles();
    } catch (error) {
      console.error('Error deleting volunteer role:', error);
      toast.error('Failed to delete volunteer role');
    }
  };

  if (!teamId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Invalid team ID</p>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to={`/teams/${teamId}/volunteers`}
              className="flex items-center gap-2 text-brand-primary hover:opacity-90"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Volunteers
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Volunteer Roles</h1>
          </div>

          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <VolunteerRolesList
            roles={roles}
            onEdit={(role) => {
              setEditingRole(role);
              setShowRoleModal(true);
            }}
            onDelete={handleDeleteRole}
            isEditable
          />
        )}

        <VolunteerRoleModal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setEditingRole(null);
          }}
          onSave={handleSaveRole}
          initialData={editingRole || undefined}
        />
      </div>
    </PageLayout>
  );
}