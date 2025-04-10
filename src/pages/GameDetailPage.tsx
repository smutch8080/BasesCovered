import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Game } from '../types/game';
import { Event } from '../types/events';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { GameOverview } from '../components/games/GameOverview';
import { GameLineup } from '../components/games/GameLineup';
import { GameAttendance } from '../components/games/GameAttendance';
import { GameVolunteers } from '../components/games/GameVolunteers';
import { SimpleScore } from '../components/games/SimpleScore/SimpleScore';
import toast from 'react-hot-toast';

function GameDetailPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lineup' | 'attendance' | 'volunteers' | 'score'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadGameData = async () => {
      if (!gameId) return;

      try {
        setIsLoading(true);
        
        // Load game data
        const gameDoc = await getDoc(doc(db, 'games', gameId));
        if (!gameDoc.exists()) {
          toast.error('Game not found');
          return;
        }

        const gameData = gameDoc.data();
        const game = {
          ...gameData,
          id: gameDoc.id,
          startDate: gameData.startDate.toDate(),
          endDate: gameData.endDate.toDate(),
          createdAt: gameData.createdAt.toDate(),
          updatedAt: gameData.updatedAt.toDate()
        } as Game;

        setGame(game);

        // Load associated event data
        if (game.eventId) {
          const eventDoc = await getDoc(doc(db, 'events', game.eventId));
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setEvent({
              ...eventData,
              id: eventDoc.id,
              startDate: eventData.startDate.toDate(),
              endDate: eventData.endDate.toDate(),
              createdAt: eventData.createdAt.toDate(),
              updatedAt: eventData.updatedAt.toDate()
            } as Event);
          }
        }
      } catch (error) {
        console.error('Error loading game:', error);
        toast.error('Unable to load game details');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [gameId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600 dark:text-gray-400">Game not found</p>
      </div>
    );
  }

  const isCoach = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.id === game.teamId ||
    currentUser.teams?.includes(game.teamId)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/games"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </Link>
      </div>

      {/* Game Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {game.isHomeTeam ? `${game.teamName} vs ${game.opponent}` : `${game.teamName} @ ${game.opponent}`}
            </h1>
            <div className="flex flex-col md:flex-row gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{game.startDate.toLocaleDateString()} at {game.startDate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{game.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{game.attendees.confirmed.length} confirmed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-brand-gradient text-white rounded-full">
              {game.status === 'completed' ? 'Final' : 'Upcoming'}
            </span>
            {game.status === 'scheduled' && isCoach && (
              <button
                onClick={() => {/* TODO: Implement game start */}}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                <Trophy className="w-4 h-4" />
                Start Game
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('lineup')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'lineup'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Lineup
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'attendance'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'volunteers'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Volunteers
        </button>
        <button
          onClick={() => setActiveTab('score')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'score'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Score
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {activeTab === 'overview' && (
          <GameOverview 
            game={game} 
            event={event} 
            onGameUpdated={setGame} 
            isCoach={isCoach} 
          />
        )}
        {activeTab === 'lineup' && (
          <GameLineup 
            game={game} 
            onGameUpdated={setGame} 
            isCoach={isCoach} 
          />
        )}
        {activeTab === 'attendance' && (
          <GameAttendance 
            game={game} 
            event={event} 
            onGameUpdated={setGame} 
          />
        )}
        {activeTab === 'volunteers' && (
          <GameVolunteers 
            game={game} 
            event={event} 
            onGameUpdated={setGame} 
            isCoach={isCoach} 
          />
        )}
        {activeTab === 'score' && (
          <SimpleScore
            game={game}
            onGameUpdated={setGame}
          />
        )}
      </div>
    </div>
  );
}

export default GameDetailPage;