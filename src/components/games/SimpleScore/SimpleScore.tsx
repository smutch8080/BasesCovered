import React, { useState, useEffect, useRef } from 'react';
import { Game, GameScoreDetails, AtBat, GameState } from '../../../types/game';
import { Scoreboard } from './Scoreboard';
import { BoxScore } from './BoxScore';
import { AtBatTracker } from './AtBatTracker';
import { GameSummary } from './GameSummary';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';

interface SimpleScoreProps {
  game: Game;
  onGameUpdated: (game: Game) => void;
}

// Define the lineup player type
interface LineupPlayer {
  playerId: string;
  playerName: string;
  position: string;
}

// Define the lineup type
interface Lineup {
  team: LineupPlayer[];
  opponent: LineupPlayer[];
}

export const SimpleScore: React.FC<SimpleScoreProps> = ({ game, onGameUpdated }) => {
  // Create a ref to track if we should skip the update
  const isInitialRender = useRef(true);
  const prevScoreDetailsRef = useRef<string | null>(null);
  const prevGameRef = useRef<string | null>(null);
  
  // Convert homeLineup and awayLineup to the lineup format expected by the component
  useEffect(() => {
    // Only run this effect once when the component mounts
    // and only if the game doesn't already have a lineup property
    // but has homeLineup or awayLineup
    const hasLineupData = 
      (game.homeLineup && game.homeLineup.length > 0) || 
      (game.awayLineup && game.awayLineup.length > 0);
    
    if (!game.lineup && hasLineupData) {
      console.log('Converting homeLineup/awayLineup to lineup format', {
        homeLineup: game.homeLineup,
        awayLineup: game.awayLineup
      });
      
      // Create a lineup object from homeLineup and awayLineup
      const lineup: Lineup = {
        team: [],
        opponent: []
      };
      
      // Determine which lineup is the team and which is the opponent
      const teamLineup = game.isHomeTeam ? game.homeLineup : game.awayLineup;
      const opponentLineup = game.isHomeTeam ? game.awayLineup : game.homeLineup;
      
      // Convert team lineup
      if (teamLineup && teamLineup.length > 0) {
        lineup.team = teamLineup.map(player => ({
          playerId: player.id,
          playerName: player.name,
          position: player.position
        }));
      }
      
      // Convert opponent lineup
      if (opponentLineup && opponentLineup.length > 0) {
        lineup.opponent = opponentLineup.map(player => ({
          playerId: player.id,
          playerName: player.name,
          position: player.position
        }));
      }
      
      // Only update if we have valid lineup data
      if (lineup.team.length > 0 || lineup.opponent.length > 0) {
        console.log('Updating game with new lineup', lineup);
        
        // Create a new game object with the lineup
        const updatedGame = {
          ...game,
          lineup
        };
        
        // Update the game
        onGameUpdated(updatedGame);
      }
    }
  }, []);
  
  // Initialize or use existing score details
  const [scoreDetails, setScoreDetails] = useState<GameScoreDetails>(() => {
    console.log('Initializing score details - setting up initial players');
    
    if (game.scoreDetails) {
      // If we have existing score details, use them and ensure playerStats is an array
      return {
        ...game.scoreDetails,
        playerStats: Array.isArray(game.scoreDetails.playerStats) ? game.scoreDetails.playerStats : [],
        atBats: Array.isArray(game.scoreDetails.atBats) ? game.scoreDetails.atBats : [],
        inningScores: Array.isArray(game.scoreDetails.inningScores) ? game.scoreDetails.inningScores : [{ team: 0, opponent: 0 }]
      };
    }
    
    // Create default score details if none exist
    // Initialize with lineup information if available
    let currentBatterId = null;
    let currentPitcherId = null;
    
    // If we have a lineup, use the first player as the batter
    if (game.lineup?.team && game.lineup.team.length > 0) {
      currentBatterId = game.lineup.team[0].playerId;
      console.log('Setting initial batter to:', game.lineup.team[0].playerName);
    }
    
    // If we have an opponent lineup, try to find a pitcher or use the first player
    if (game.lineup?.opponent && game.lineup.opponent.length > 0) {
      const pitcher = game.lineup.opponent.find(player => 
        player.position?.toLowerCase() === 'pitcher' || 
        player.position?.toLowerCase() === 'p'
      );
      
      currentPitcherId = pitcher ? pitcher.playerId : game.lineup.opponent[0].playerId;
      console.log('Setting initial pitcher to:', pitcher?.playerName || game.lineup.opponent[0].playerName);
    }
    
    return {
      inningScores: [{ team: 0, opponent: 0 }],
      playerStats: [],
      atBats: [],
      gameState: {
        currentInning: 1,
        isTopInning: true,
        outs: 0,
        balls: 0,
        strikes: 0,
        fouls: 0,
        bases: {
          first: null,
          second: null,
          third: null
        },
        currentBatterId,
        currentPitcherId
      }
    };
  });
  
  // Track if initial player selection has been completed
  const initializedRef = useRef(false);
  
  // Initial setup effect for selecting first batter/pitcher when no at-bats exist
  useEffect(() => {
    // Skip if already initialized or if we have at-bats
    if (initializedRef.current || scoreDetails.atBats.length > 0) {
      console.log('Skipping initialization - already initialized or have at-bats');
      return;
    }

    console.log('SimpleScore initializing first batter and pitcher');
    const teamLineup = game.lineup?.team || [];
    const opponentLineup = game.lineup?.opponent || [];
    
    // Create updated gameState
    const updatedGameState = { ...scoreDetails.gameState };
    let needsUpdate = false;
    
    // Set initial batter if we have a lineup
    if (teamLineup.length > 0 && !updatedGameState.currentBatterId) {
      const firstBatter = teamLineup[0];
      updatedGameState.currentBatterId = firstBatter.playerId;
      console.log('Setting initial batter to:', firstBatter.playerName);
      needsUpdate = true;
    }
    
    // Set initial pitcher if we have an opponent lineup
    if (opponentLineup.length > 0 && !updatedGameState.currentPitcherId) {
      // Try to find a pitcher, otherwise use first player
      const pitcher = opponentLineup.find(p => 
        p.position?.toLowerCase() === 'pitcher' || 
        p.position?.toLowerCase() === 'p'
      ) || opponentLineup[0];
      
      updatedGameState.currentPitcherId = pitcher.playerId;
      console.log('Setting initial pitcher to:', pitcher.playerName);
      needsUpdate = true;
    }
    
    // Update score details if needed
    if (needsUpdate) {
      const updatedScoreDetails = {
        ...scoreDetails,
        gameState: updatedGameState
      };
      setScoreDetails(updatedScoreDetails);
      onGameUpdated({
        ...game,
        scoreDetails: updatedScoreDetails
      });
      console.log('Updated game state with initial players');
    }
    
    initializedRef.current = true;
  }, [game, scoreDetails, onGameUpdated]);
  
  // Track if we're currently recording an at-bat
  const [isRecordingAtBat, setIsRecordingAtBat] = useState(false);
  
  // Track active tab
  const [activeTab, setActiveTab] = useState<'scoreboard' | 'boxscore' | 'summary'>('scoreboard');
  
  // Save score details when they change
  useEffect(() => {
    // Skip the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevScoreDetailsRef.current = JSON.stringify(scoreDetails);
      prevGameRef.current = JSON.stringify(game);
      return;
    }
    
    // Only update the game if scoreDetails has actually changed in a meaningful way
    // AND if the game object hasn't changed since our last update
    // This prevents infinite loops when the parent component re-renders
    const currentScoreDetailsString = JSON.stringify(scoreDetails);
    const currentGameString = JSON.stringify(game);
    
    if (
      currentScoreDetailsString !== prevScoreDetailsRef.current && 
      currentGameString === prevGameRef.current &&
      game.id
    ) {
      console.log('Saving score details to the database and updating game...');
      
      const updatedGame = {
        ...game,
        scoreDetails,
        updatedAt: new Date()
      };
      
      // Update local state via the callback
      onGameUpdated(updatedGame);
      
      // Save to database
      saveGameToDatabase(updatedGame).catch(error => {
        console.error('Error saving game to database:', error);
        toast.error('Failed to save game data to the database');
      });
      
      // Update the refs with the current values for the next comparison
      prevScoreDetailsRef.current = currentScoreDetailsString;
      prevGameRef.current = currentGameString;
    }
  }, [scoreDetails, game, onGameUpdated]);
  
  // Function to save game data to Firestore
  const saveGameToDatabase = async (updatedGame: Game) => {
    if (!updatedGame.id) {
      console.error('Cannot save game without an ID');
      return;
    }
    
    try {
      const gameRef = doc(db, 'games', updatedGame.id);
      
      // Check if scoreDetails exists
      if (!updatedGame.scoreDetails) {
        console.error('Game has no score details to save');
        return;
      }
      
      // Prepare the data for Firestore (convert Date objects to Timestamps)
      const firestoreData = {
        scoreDetails: {
          ...updatedGame.scoreDetails,
          atBats: updatedGame.scoreDetails.atBats.map(atBat => ({
            ...atBat,
            timestamp: Timestamp.fromDate(
              typeof atBat.timestamp === 'string'
                ? new Date(atBat.timestamp)
                : atBat.timestamp instanceof Date
                  ? atBat.timestamp
                  : new Date()
            )
          }))
        },
        status: updatedGame.status || 'inProgress',
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      console.log('Updating game in Firestore:', gameRef.id);
      await updateDoc(gameRef, firestoreData);
      console.log('Game successfully updated in database');
      toast.success('Game data saved');
    } catch (error) {
      console.error('Error updating game in Firestore:', error);
      throw error;
    }
  };
  
  // Get current batter and pitcher info
  const getCurrentBatter = () => {
    if (!scoreDetails.gameState.currentBatterId) return null;
    
    const lineup = game.lineup?.team || [];
    const player = lineup.find(p => p.playerId === scoreDetails.gameState.currentBatterId);
    
    if (!player) return null;
    
    return {
      playerId: player.playerId,
      name: player.playerName
    };
  };
  
  const getCurrentPitcher = () => {
    if (!scoreDetails.gameState.currentPitcherId) return null;
    
    const lineup = game.lineup?.opponent || [];
    const player = lineup.find(p => p.playerId === scoreDetails.gameState.currentPitcherId);
    
    if (!player) return null;
    
    return {
      playerId: player.playerId,
      name: player.playerName
    };
  };
  
  // Handle score updates from Scoreboard
  const handleScoreUpdate = (updatedScoreDetails: GameScoreDetails) => {
    console.log('handleScoreUpdate called with:', updatedScoreDetails);
    
    // Make a deep copy of the current scoreDetails
    const currentDetails = { ...scoreDetails };
    
    // Check if we're receiving new at-bats
    if (Array.isArray(updatedScoreDetails.atBats) && 
        Array.isArray(currentDetails.atBats) &&
        updatedScoreDetails.atBats.length > currentDetails.atBats.length) {
      console.log('New at-bat detected!', 
        'Current at-bats:', currentDetails.atBats.length, 
        'New at-bats:', updatedScoreDetails.atBats.length);
      
      // Identify the new at-bat(s)
      const newAtBats = updatedScoreDetails.atBats.slice(currentDetails.atBats.length);
      console.log('New at-bat(s):', newAtBats);
    }
    
    // Create a defensive copy with proper data structures
    const newScoreDetails = {
      ...currentDetails,
      // Carefully merge arrays to avoid duplicates or losing data
      playerStats: Array.isArray(updatedScoreDetails.playerStats) ? 
        updatedScoreDetails.playerStats : 
        (Array.isArray(currentDetails.playerStats) ? currentDetails.playerStats : []),
      inningScores: Array.isArray(updatedScoreDetails.inningScores) ? 
        updatedScoreDetails.inningScores : 
        (Array.isArray(currentDetails.inningScores) ? currentDetails.inningScores : []),
      // Always take the updated game state
      gameState: updatedScoreDetails.gameState || currentDetails.gameState,
      // Make sure we don't lose any at-bats
      atBats: Array.isArray(updatedScoreDetails.atBats) ? 
        updatedScoreDetails.atBats : 
        (Array.isArray(currentDetails.atBats) ? currentDetails.atBats : [])
    };
    
    console.log('Updated score details:', newScoreDetails);
    console.log('At-bats count after update:', newScoreDetails.atBats?.length || 0);
    
    // Update local state with the new score details
    setScoreDetails(newScoreDetails);
    
    // Update the game with the new score details
    // This will trigger the useEffect that handles saving to the database
    onGameUpdated({
      ...game,
      scoreDetails: newScoreDetails
    });
  };
  
  // Handle at-bat completion
  const handleAtBatComplete = (atBat: AtBat) => {
    console.log('handleAtBatComplete called with atBat:', atBat);
    
    // Add timestamp if not provided
    if (!atBat.timestamp) {
      atBat.timestamp = new Date();
    }
    
    // Make a copy of the current at-bats and add the new one
    const updatedAtBats = Array.isArray(scoreDetails.atBats) 
      ? [...scoreDetails.atBats, atBat] 
      : [atBat];
    
    // Update player stats based on the at-bat
    // Ensure playerStats is an array before updating
    const existingPlayerStats = Array.isArray(scoreDetails.playerStats) 
      ? [...scoreDetails.playerStats] 
      : [];
    const updatedPlayerStats = [...existingPlayerStats];
    
    // Helper to find a player by ID
    const findPlayerById = (playerId: string) => {
      // Check the team lineup first
      const teamPlayer = game.lineup?.team?.find(p => p.playerId === playerId);
      if (teamPlayer) return teamPlayer;
      
      // Then check the opponent lineup
      const opponentPlayer = game.lineup?.opponent?.find(p => p.playerId === playerId);
      if (opponentPlayer) return opponentPlayer;
      
      return null;
    };
    
    // Find or create stats for the batter
    let batterStats = updatedPlayerStats.find(stats => stats.playerId === atBat.playerId);
    
    if (!batterStats) {
      // If we don't have stats for this player yet, create them
      const player = findPlayerById(atBat.playerId);
      batterStats = {
        playerId: atBat.playerId,
        playerName: player?.playerName || atBat.playerName || 'Unknown Player',
        position: player?.position || '',
        atBats: 0,
        hits: 0,
        runs: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        homeruns: 0,
        rbi: 0,
        walks: 0,
        strikeouts: 0,
        errors: 0
      };
      updatedPlayerStats.push(batterStats);
    }
    
    // Update stats based on result
    switch (atBat.result) {
      case 'single':
        batterStats.hits++;
        batterStats.singles++;
        batterStats.atBats++;
        break;
      case 'double':
        batterStats.hits++;
        batterStats.doubles++;
        batterStats.atBats++;
        break;
      case 'triple':
        batterStats.hits++;
        batterStats.triples++;
        batterStats.atBats++;
        break;
      case 'homerun':
        batterStats.hits++;
        batterStats.homeruns++;
        batterStats.atBats++;
        batterStats.runs++;
        break;
      case 'walk':
      case 'hitByPitch':
        batterStats.walks++;
        break;
      case 'strikeout':
        batterStats.strikeouts++;
        batterStats.atBats++;
        break;
      case 'error':
        // Don't count as an at-bat
        break;
      default:
        // All other results count as an at-bat
        batterStats.atBats++;
    }
    
    // Add RBIs from the at-bat result
    if (atBat.rbi > 0) {
    batterStats.rbi += atBat.rbi;
    
      // Update inning scores based on the RBIs
      const updatedInningScores = [...scoreDetails.inningScores];
      // Ensure the inning exists
      while (updatedInningScores.length < atBat.inning) {
        updatedInningScores.push({ team: 0, opponent: 0 });
      }
      
      // Update the score for the current team
      const teamKey = atBat.isTopInning ? 'team' : 'opponent';
      updatedInningScores[atBat.inning - 1][teamKey] += atBat.rbi;
      
      console.log('Updated inning scores with RBIs:', updatedInningScores);
      
      // Update score details with the new inning scores
      setScoreDetails(prev => ({
        ...prev,
        atBats: updatedAtBats,
        playerStats: updatedPlayerStats,
        inningScores: updatedInningScores,
        gameState: {
          ...prev.gameState,
          balls: 0,
          strikes: 0
        }
      }));
    } else {
      // If no RBIs, just update the at-bats and player stats
    setScoreDetails(prev => ({
      ...prev,
      atBats: updatedAtBats,
      playerStats: updatedPlayerStats,
      gameState: {
        ...prev.gameState,
        balls: 0,
        strikes: 0
      }
    }));
    }
    
    console.log('Updated at-bats:', updatedAtBats);
    console.log('Updated player stats:', updatedPlayerStats);
    
    // Exit at-bat recording mode
    setIsRecordingAtBat(false);
  };
  
  // Render the appropriate content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'scoreboard':
        return (
          <div>
            <Scoreboard
              game={game}
              scoreDetails={scoreDetails}
              onScoreUpdate={handleScoreUpdate}
              onRecordAtBat={handleAtBatComplete}
            />
          </div>
        );
      case 'boxscore':
        return <BoxScore game={game} scoreDetails={scoreDetails} />;
      case 'summary':
        return <GameSummary game={game} scoreDetails={scoreDetails} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {game.teamName} vs {game.opponent}
      </h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('scoreboard')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'scoreboard' && !isRecordingAtBat
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Scoreboard
        </button>
        <button
          onClick={() => setActiveTab('boxscore')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'boxscore' && !isRecordingAtBat
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Box Score
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'summary' && !isRecordingAtBat
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Game Summary
        </button>
      </div>
      
      {/* Main Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}; 