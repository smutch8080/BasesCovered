import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Game } from '../types/game';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function GamesPage() {
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [previousGames, setPreviousGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadGames = async () => {
      if (!currentUser?.teams?.length) return;

      try {
        setIsLoading(true);
        const now = new Date();
        const gamesRef = collection(db, 'games');

        // Process teams in batches of 10 (Firestore limitation)
        const allGames: Game[] = [];
        for (let i = 0; i < currentUser.teams.length; i += 10) {
          const teamBatch = currentUser.teams.slice(i, i + 10);
          
          // Query upcoming games
          const upcomingQuery = query(
            gamesRef,
            where('teamId', 'in', teamBatch),
            where('startDate', '>=', now),
            orderBy('startDate', 'asc')
          );

          // Query previous games
          const previousQuery = query(
            gamesRef,
            where('teamId', 'in', teamBatch),
            where('startDate', '<', now),
            orderBy('startDate', 'desc')
          );

          const [upcomingSnapshot, previousSnapshot] = await Promise.all([
            getDocs(upcomingQuery),
            getDocs(previousQuery)
          ]);

          upcomingSnapshot.forEach(doc => {
            const data = doc.data();
            allGames.push({
              ...data,
              id: doc.id,
              startDate: data.startDate.toDate(),
              endDate: data.endDate.toDate(),
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate()
            } as Game);
          });

          previousSnapshot.forEach(doc => {
            const data = doc.data();
            allGames.push({
              ...data,
              id: doc.id,
              startDate: data.startDate.toDate(),
              endDate: data.endDate.toDate(),
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate()
            } as Game);
          });
        }

        // Split games into upcoming and previous
        const upcoming: Game[] = [];
        const previous: Game[] = [];
        allGames.forEach(game => {
          if (game.startDate >= now) {
            upcoming.push(game);
          } else {
            previous.push(game);
          }
        });

        setUpcomingGames(upcoming);
        setPreviousGames(previous);
      } catch (error) {
        console.error('Error loading games:', error);
        toast.error('Unable to load games');
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, [currentUser]);

  const renderGameCard = (game: Game) => (
    <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {game.isHomeTeam ? `${game.teamName} vs ${game.opponent}` : `${game.teamName} @ ${game.opponent}`}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
            <Calendar className="w-4 h-4" />
            <span>{game.startDate.toLocaleDateString()} at {game.startDate.toLocaleTimeString()}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{game.location}</p>
        </div>
        <span className="inline-block px-3 py-1 text-sm font-medium bg-brand-gradient text-white rounded-full">
          {game.status === 'completed' ? 'Final' : 'Upcoming'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Attendance</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-600">{game.attendees.confirmed.length}</span>
            <span className="text-gray-400">/</span>
            <span className="text-yellow-600">{game.attendees.maybe.length}</span>
            <span className="text-gray-400">/</span>
            <span className="text-red-600">{game.attendees.declined.length}</span>
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Volunteers</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-brand-primary">
              {game.volunteerSlots.filter(slot => slot.status === 'filled').length}
              /
              {game.volunteerSlots.length}
            </span>
          </div>
        </div>

        {game.status === 'completed' && game.score && (
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Final Score</span>
            <div className="font-semibold mt-1">
              {game.isHomeTeam ? (
                <span>{game.score.team} - {game.score.opponent}</span>
              ) : (
                <span>{game.score.opponent} - {game.score.team}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <Link
          to={`/games/${game.id}`}
          className="text-brand-primary hover:opacity-90 font-medium"
        >
          Manage Game →
        </Link>
      </div>
    </div>
  );

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Games</h1>
          <Link
            to="/events/new?type=game"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create Game
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | 'week' | 'month')}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="all">All Dates</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading games...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Upcoming Games
              </h2>
              <div className="space-y-4">
                {upcomingGames.length > 0 ? (
                  upcomingGames.map(game => renderGameCard(game))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No upcoming games scheduled
                  </p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Previous Games
              </h2>
              <div className="space-y-4">
                {previousGames.length > 0 ? (
                  previousGames.map(game => renderGameCard(game))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No previous games found
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default GamesPage;