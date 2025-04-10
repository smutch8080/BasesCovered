import React from 'react';
import { Link } from 'react-router-dom';
import { HandHelping, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VolunteerDashboard } from '../components/volunteers/VolunteerDashboard';

function VolunteersPage() {
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <HandHelping className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-bold text-gray-800">Volunteer Dashboard</h1>
        </div>

        {isCoach && currentUser.teams?.length > 0 && (
          <Link
            to={`/teams/${currentUser.teams[0]}/volunteers/roles`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manage Roles
          </Link>
        )}
      </div>

      <VolunteerDashboard />
    </div>
  );
}

export default VolunteersPage;