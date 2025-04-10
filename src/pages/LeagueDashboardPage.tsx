import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, FileText, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { League, LeagueStats } from '../types/league';
import { Team } from '../types/team';
import { LeagueTeamsList } from '../components/teams/LeagueTeamsList';
import { fetchLeagueData, fetchLeagueTeams, fetchLeagueStats } from '../services/leagues';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function LeagueDashboardPage() {
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLeagueData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        console.log('Loading league data for user:', currentUser.id);

        // Load league data
        const leagueData = await fetchLeagueData(currentUser.id);
        if (!leagueData) {
          console.log('No league found for user');
          return;
        }
        setLeague(leagueData);

        // Load teams and stats in parallel
        const [leagueTeams, leagueStats] = await Promise.all([
          fetchLeagueTeams(leagueData.id),
          fetchLeagueStats(leagueData.id)
        ]);

        setTeams(leagueTeams);
        setStats(leagueStats);
      } catch (error) {
        console.error('Error loading league dashboard:', error);
        toast.error('Unable to load league data');
      } finally {
        setIsLoading(false);
      }
    };

    loadLeagueData();
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'league_manager') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No League Found</h1>
          <p className="text-gray-600 mb-6">You haven't created a league yet.</p>
          <Link
            to="/leagues/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create League
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* League Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{league.name}</h1>
              <p className="text-gray-600">
                {league.location.city}, {league.location.state}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to={`/league/${league.id}/resources`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                  hover:bg-gray-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Resources
              </Link>
              <Link
                to="/teams/new"
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-brand-primary" />
                <h3 className="font-semibold text-gray-800">Teams</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalTeams}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-brand-primary" />
                <h3 className="font-semibold text-gray-800">Players</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.totalPlayers}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-brand-primary" />
                <h3 className="font-semibold text-gray-800">Active Seasons</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.activeSeasons}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-brand-primary" />
                <h3 className="font-semibold text-gray-800">Upcoming Events</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stats.upcomingEvents}</p>
            </div>
          </div>
        )}

        {/* Teams Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">League Teams</h2>
            <Link
              to="/teams/new"
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </Link>
          </div>

          <LeagueTeamsList teams={teams} leagueId={league.id} />
        </div>
      </div>
    </PageLayout>
  );
}