import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Plus, ArrowLeft } from 'lucide-react';
import { VolunteerStats } from '../types/volunteer';
import { VolunteerStatsCard } from '../components/volunteers/VolunteerStatsCard';
import { fetchTeamVolunteerStats } from '../services/volunteers';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function TeamVolunteersPage() {
  const { teamId } = useParams();
  const [volunteerStats, setVolunteerStats] = useState<Record<string, VolunteerStats>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!teamId) return;

      try {
        setIsLoading(true);
        const stats = await fetchTeamVolunteerStats(teamId);
        setVolunteerStats(stats);
      } catch (error) {
        console.error('Error loading volunteer stats:', error);
        toast.error('Unable to load volunteer statistics');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [teamId]);

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to={`/teams/${teamId}`}
              className="flex items-center gap-2 text-brand-primary hover:opacity-90"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Team
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Team Volunteers</h1>
          </div>

          <Link
            to={`/teams/${teamId}/volunteers/roles`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Manage Roles
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : Object.keys(volunteerStats).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(volunteerStats).map(([userId, stats]) => (
              <VolunteerStatsCard key={userId} stats={stats} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Volunteer Activity Yet</h2>
            <p className="text-gray-600">
              Start by creating volunteer roles and assigning them to events.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}