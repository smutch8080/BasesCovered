import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Homework } from '../types/homework';
import { HomeworkList } from '../components/homework/HomeworkList';
import { Plus, BookOpen, Search, Filter } from 'lucide-react';
import { fetchUserHomework } from '../services/homeworkService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

function HomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [filteredHomework, setFilteredHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showFilters, setShowFilters] = useState(true);

  // Team and player data
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);

  // Load teams and players
  useEffect(() => {
    const loadTeamsAndPlayers = async () => {
      if (!currentUser) return;

      try {
        // Load teams
        const teamsRef = collection(db, 'teams');
        const teamsQuery = query(
          teamsRef,
          where('coachId', '==', currentUser.id)
        );
        const teamsSnapshot = await getDocs(teamsQuery);
        const loadedTeams = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setTeams(loadedTeams);

        // Load players if a team is selected
        if (selectedTeam !== 'all') {
          const teamDoc = await getDocs(query(
            teamsRef,
            where('__name__', '==', selectedTeam)
          ));
          
          if (!teamDoc.empty) {
            const teamData = teamDoc.docs[0].data();
            setPlayers(teamData.players || []);
          }
        }
      } catch (error) {
        console.error('Error loading teams and players:', error);
        toast.error('Unable to load teams and players');
      }
    };

    loadTeamsAndPlayers();
  }, [currentUser, selectedTeam]);

  useEffect(() => {
    const loadHomework = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const loadedHomework = await fetchUserHomework(currentUser);
        setHomework(loadedHomework);
        setFilteredHomework(loadedHomework);
      } catch (error) {
        console.error('Error loading homework:', error);
        toast.error('Unable to load homework assignments');
      } finally {
        setIsLoading(false);
      }
    };

    loadHomework();
  }, [currentUser]);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    const applyFilters = () => {
      let filtered = [...homework];

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(hw =>
          hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hw.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply team filter
      if (selectedTeam !== 'all') {
        filtered = filtered.filter(hw => hw.teamId === selectedTeam);
      }

      // Apply player filter
      if (selectedPlayer !== 'all') {
        filtered = filtered.filter(hw => 
          !hw.playerId || hw.playerId === selectedPlayer
        );
      }

      // Apply status filter
      if (status !== 'all') {
        const now = new Date();
        filtered = filtered.filter(hw => {
          const submission = currentUser && hw.submissions.find(s => s.playerId === currentUser.id);
          const isOverdue = new Date(hw.dueDate) < now;

          switch (status) {
            case 'completed':
              return submission?.status === 'completed';
            case 'pending':
              return !submission && !isOverdue;
            case 'overdue':
              return !submission?.status && isOverdue;
            default:
              return true;
          }
        });
      }

      // Apply date range filter
      if (dateRange.start) {
        filtered = filtered.filter(hw => 
          new Date(hw.dueDate) >= new Date(dateRange.start)
        );
      }
      if (dateRange.end) {
        filtered = filtered.filter(hw => 
          new Date(hw.dueDate) <= new Date(dateRange.end)
        );
      }

      setFilteredHomework(filtered);
    };

    applyFilters();
  }, [homework, searchTerm, status, selectedTeam, selectedPlayer, dateRange, currentUser]);

  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-bold text-gray-800">
            {isCoach ? 'Manage Homework' : 'My Homework'}
          </h1>
        </div>

        {isCoach && (
          <Link
            to="/homework/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Assign Homework
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search homework..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg
              hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {isCoach && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => {
                      setSelectedTeam(e.target.value);
                      setSelectedPlayer('all'); // Reset player when team changes
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="all">All Teams</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Player
                  </label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    disabled={selectedTeam === 'all'}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Players</option>
                    {players.map(player => (
                      <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due After
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Before
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading homework assignments...</p>
        </div>
      ) : (
        <HomeworkList
          homework={filteredHomework}
          playerId={currentUser?.role === 'player' ? currentUser.id : undefined}
        />
      )}
    </div>
  );
}

export default HomeworkPage;