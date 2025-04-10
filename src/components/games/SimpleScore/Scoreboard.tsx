import React, { useState, useEffect, useRef } from 'react';
import { Game, GameScoreDetails, AtBat, AtBatResult, PlayerGameStats, InningScore } from '../../../types/game';
import { nanoid } from 'nanoid';
import { X, Circle, CheckCircle, User, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';

interface ScoreboardProps {
  game: Game;
  scoreDetails: GameScoreDetails;
  onScoreUpdate: (updatedScoreDetails: GameScoreDetails) => void;
  onRecordAtBat?: (atBat: AtBat) => void; // Optional prop for recording at-bats with AtBat parameter
}

// Define the Player type if it's not already imported
interface Player {
  playerId: string;
  playerName: string;
  position: string;
}

// Types for our stolen base tracking
type BaseType = 'first' | 'second' | 'third';
type StealOutcome = 'safe' | 'out';

interface RunnerAdvancement {
  from: BaseType;
  to: BaseType | 'home';
  outcome: StealOutcome;
}

// Add these type definitions at the top of the file after the imports
interface GroupedAtBats {
  [key: string]: AtBat[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ game, scoreDetails, onScoreUpdate, onRecordAtBat }) => {
  const [showAtBatModal, setShowAtBatModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(() => {
    console.log('Initializing batter selection to:', scoreDetails.gameState.currentBatterId);
    return scoreDetails.gameState.currentBatterId;
  });
  const [selectedPitcherId, setSelectedPitcherId] = useState<string | null>(() => {
    console.log('Initializing pitcher selection to:', scoreDetails.gameState.currentPitcherId);
    return scoreDetails.gameState.currentPitcherId;
  });
  const hasInitializedRef = useRef(false);
  
  // Get current game state
  const { gameState, inningScores } = scoreDetails;
  const { currentInning, isTopInning, outs, balls, strikes, bases } = gameState;
  
  // Calculate total score
  const totalTeamScore = inningScores.reduce((sum, inning) => sum + (inning.team || 0), 0);
  const totalOpponentScore = inningScores.reduce((sum, inning) => sum + (inning.opponent || 0), 0);
  
  // Get team lineup
  const teamLineup = game.lineup?.team || [];
  const opponentLineup = game.lineup?.opponent || [];
  
  // Immediate initialization on component mount
  useEffect(() => {
    console.log('Scoreboard mounted - checking initial player selections');
    
    // Skip if already initialized
    if (hasInitializedRef.current) {
      return;
    }
    
    // Create a copy of the current game state
    let updatedGameState = { ...gameState };
    let needsUpdate = false;
    
    // If no batter is selected but we have a lineup, select the first batter
    if (!selectedPlayerId && teamLineup.length > 0) {
      const firstBatter = teamLineup[0];
      setSelectedPlayerId(firstBatter.playerId);
      updatedGameState.currentBatterId = firstBatter.playerId;
      console.log('No batter selected, initializing with first batter:', firstBatter.playerName);
      needsUpdate = true;
    }
    
    // If no pitcher is selected but we have an opponent lineup, select a pitcher or the first player
    if (!selectedPitcherId && opponentLineup.length > 0) {
      const pitcher = opponentLineup.find(p => 
        p.position?.toLowerCase() === 'pitcher' || 
        p.position?.toLowerCase() === 'p'
      ) || opponentLineup[0];
      
      setSelectedPitcherId(pitcher.playerId);
      updatedGameState.currentPitcherId = pitcher.playerId;
      console.log('No pitcher selected, initializing with:', pitcher.playerName);
      needsUpdate = true;
    }
    
    // Update game state if needed
    if (needsUpdate) {
      console.log('Updating game state with initial player selections');
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
    
    hasInitializedRef.current = true;
  }, []);
  
  // Auto-select batter and pitcher based on inning and current game state
  useEffect(() => {
    // Skip if we don't have lineups yet or the component hasn't fully initialized
    if (teamLineup.length === 0 || opponentLineup.length === 0 || hasInitializedRef.current === false) {
      return;
    }
    
    // Get the correct lineup for the current inning
    const currentBattingLineup = isTopInning ? teamLineup : opponentLineup;
    const currentPitchingLineup = isTopInning ? opponentLineup : teamLineup;
    
    console.log('Auto-selecting players based on current inning:', 
      isTopInning ? 'Top' : 'Bottom', 
      currentInning);
    
    // Ensure we have a valid batter selected from the correct lineup
    if (!selectedPlayerId || !currentBattingLineup.some(p => p.playerId === selectedPlayerId)) {
      // If no valid batter is selected from the current lineup, select the first player
      const firstBatter = currentBattingLineup[0];
      setSelectedPlayerId(firstBatter.playerId);
      
      // Also update the game state
      const updatedGameState = {
        ...gameState,
        currentBatterId: firstBatter.playerId
      };
      
      console.log('Setting initial batter for this inning:', firstBatter.playerName);
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
    
    // Ensure we have a valid pitcher selected from the correct lineup
    if (!selectedPitcherId || !currentPitchingLineup.some(p => p.playerId === selectedPitcherId)) {
      // Look for a pitcher or use the first player
      const pitcher = currentPitchingLineup.find(p => 
        p.position?.toLowerCase() === 'pitcher' || 
        p.position?.toLowerCase() === 'p'
      ) || currentPitchingLineup[0];
      
      setSelectedPitcherId(pitcher.playerId);
      
      // Also update the game state
      const updatedGameState = {
        ...gameState,
        currentPitcherId: pitcher.playerId
      };
      
      console.log('Setting initial pitcher for this inning:', pitcher.playerName);
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
    
    hasInitializedRef.current = true;
  }, [teamLineup, opponentLineup, isTopInning, currentInning, gameState]);
  
  // Show the appropriate lineup in the batter dropdown based on the current inning
  const getCurrentBattingLineup = () => {
    return isTopInning ? teamLineup : opponentLineup;
  };

  // Show the appropriate lineup in the pitcher dropdown based on the current inning
  const getCurrentPitchingLineup = () => {
    return isTopInning ? opponentLineup : teamLineup;
  };

  // Update the selected player if needed after inning changes
  useEffect(() => {
    console.log('Inning or top/bottom changed, checking player selections');
    
    // Get the correct lineups for the current inning
    const currentBattingLineup = getCurrentBattingLineup();
    const currentPitchingLineup = getCurrentPitchingLineup();
    
    // Check if the currently selected batter is from the correct lineup
    const isBatterValid = currentBattingLineup.some(p => p.playerId === selectedPlayerId);
    if (!isBatterValid && currentBattingLineup.length > 0) {
      const firstBatter = currentBattingLineup[0];
      console.log('Selected batter is not from the current batting lineup, switching to', firstBatter.playerName);
      setSelectedPlayerId(firstBatter.playerId);
      
      // Update game state
      const updatedGameState = {
        ...gameState,
        currentBatterId: firstBatter.playerId
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
    
    // Check if the currently selected pitcher is from the correct lineup
    const isPitcherValid = currentPitchingLineup.some(p => p.playerId === selectedPitcherId);
    if (!isPitcherValid && currentPitchingLineup.length > 0) {
      const pitcher = currentPitchingLineup.find(p => 
        p.position?.toLowerCase() === 'pitcher' || 
        p.position?.toLowerCase() === 'p'
      ) || currentPitchingLineup[0];
      
      console.log('Selected pitcher is not from the current pitching lineup, switching to', pitcher.playerName);
      setSelectedPitcherId(pitcher.playerId);
      
      // Update game state
      const updatedGameState = {
        ...gameState,
        currentPitcherId: pitcher.playerId
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
  }, [isTopInning, currentInning]);
  
  // Keep the batter dropdown in sync with the game state
  useEffect(() => {
    if (gameState.currentBatterId && gameState.currentBatterId !== selectedPlayerId) {
      const currentBattingLineup = isTopInning ? teamLineup : opponentLineup;
      const player = currentBattingLineup.find(p => p.playerId === gameState.currentBatterId);
      
      console.log('Updating batter dropdown selection to match game state:', 
        gameState.currentBatterId, 
        'Current selection:', selectedPlayerId,
        'Player found:', player?.playerName);
        
      setSelectedPlayerId(gameState.currentBatterId);
    }
  }, [gameState.currentBatterId, selectedPlayerId, isTopInning, teamLineup, opponentLineup]);
  
  // Log bases state when it changes
  useEffect(() => {
    console.log('Bases state changed:', bases);
  }, [bases]);
  
  // Update ball count
  const handleBallClick = () => {
    const newBalls = gameState.balls + 1;
    
    if (newBalls >= 4) {
      // Walk
      handleAtBatResult('walk');
    } else {
      // Just update ball count
      const updatedGameState = {
        ...gameState,
        balls: newBalls
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
  };
  
  // Update strike count
  const handleStrikeClick = () => {
    const newStrikes = gameState.strikes + 1;
    
    if (newStrikes >= 3) {
      // Strikeout
      handleAtBatResult('strikeout');
    } else {
      // Just update strike count
      const updatedGameState = {
        ...gameState,
        strikes: newStrikes
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
  };
  
  // Handle foul ball
  const handleFoulClick = () => {
    // If already at 2 strikes, a foul doesn't add another strike
    if (gameState.strikes < 2) {
      const newStrikes = gameState.strikes + 1;
      
      // Update strike count
      const updatedGameState = {
        ...gameState,
        strikes: newStrikes,
        fouls: (gameState.fouls || 0) + 1
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    } else {
      // Just increment fouls without adding a strike or changing batter
      const updatedGameState = {
        ...gameState,
        fouls: (gameState.fouls || 0) + 1
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
      
      // Log the foul ball with 2 strikes
      console.log('Foul ball with 2 strikes - count remains the same');
    }
  };
  
  // Update out count
  const handleOutClick = () => {
    const newOuts = gameState.outs + 1;
    
    if (newOuts >= 3) {
      // End of half-inning
      handleEndOfHalfInning();
    } else {
      // Just update out count
      const updatedGameState = {
        ...gameState,
        outs: newOuts,
        // Reset ball and strike count for next batter
        balls: 0,
        strikes: 0
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
    }
  };
  
  // Handle end of half-inning
  const handleEndOfHalfInning = () => {
    const newIsTopInning = !isTopInning;
    let newInning = currentInning;
    
    if (!newIsTopInning) {
      // If switching to bottom of inning, keep same inning
    } else {
      // If switching to top of next inning, increment inning
      newInning = currentInning + 1;
    }
    
    const updatedGameState = {
      ...gameState,
      currentInning: newInning,
      isTopInning: newIsTopInning,
      outs: 0,
      balls: 0,
      strikes: 0,
      bases: {
        first: null,
        second: null,
        third: null
      }
    };
    
    onScoreUpdate({
      ...scoreDetails,
      gameState: updatedGameState
    });
  };
  
  // Helper function to select the next batter in the lineup
  const selectNextBatter = ({ currentLineup, currentPlayerId }: { currentLineup: Player[], currentPlayerId: string | null }) => {
    console.log("selectNextBatter called", { currentLineup, currentPlayerId });
    
    if (!currentLineup || currentLineup.length === 0) {
      console.log("Cannot select next batter: lineup is empty");
      return null;
    }
    
    if (!currentPlayerId) {
      console.log("No current player selected, selecting first player in lineup");
      return currentLineup[0];
    }
    
    const currentIndex = currentLineup.findIndex(player => player.playerId === currentPlayerId);
    console.log("Current player index in lineup:", currentIndex);
    
    if (currentIndex === -1) {
      console.log("Current player not found in lineup, selecting first player");
      return currentLineup[0];
    }
    
    const nextIndex = (currentIndex + 1) % currentLineup.length;
    console.log(`Selecting next player at index ${nextIndex}`);
    return currentLineup[nextIndex];
  };
  
  // Handle at-bat result
  const handleAtBatResult = async (result: AtBatResult) => {
    if (!selectedPlayerId) return;
    
    console.log(`Recording at bat result: ${result}`);
    
    // Create updated game state
    let updatedGameState = { ...gameState };
    
    // Helper function to handle three outs
    const handleThreeOuts = () => {
      if (gameState.outs >= 3) {
        const newIsTopInning = !gameState.isTopInning;
        const newInning = newIsTopInning ? gameState.currentInning + 1 : gameState.currentInning;
        
        const updatedGameState = {
          ...gameState,
          currentInning: newInning,
          isTopInning: newIsTopInning,
          outs: 0,
          balls: 0,
          strikes: 0,
          bases: {
            first: null,
            second: null,
            third: null
          }
        };
        
        onScoreUpdate({
          ...scoreDetails,
          gameState: updatedGameState
        });
        
        return true;
      }
      return false;
    };
    
    // Create at-bat record
    const getCurrentBattingLineup = () => isTopInning ? teamLineup : opponentLineup;
    const getCurrentPitchingLineup = () => isTopInning ? opponentLineup : teamLineup;
    
    const currentBattingLineup = getCurrentBattingLineup();
    const currentPitchingLineup = getCurrentPitchingLineup();
    
    // Find the current batter and pitcher names
    const currentBatter = currentBattingLineup.find(p => p.playerId === selectedPlayerId);
    const currentPitcher = currentPitchingLineup.find(p => p.playerId === selectedPitcherId);
    
    // Create the at-bat record
    const currentAtBat: AtBat = {
      id: nanoid(),
      playerId: selectedPlayerId || '',
      playerName: currentBatter?.playerName || 'Unknown Player',
      inning: currentInning,
      isTopInning,
      pitcherId: selectedPitcherId || '',
      pitcherName: currentPitcher?.playerName || 'Unknown Pitcher',
      balls: gameState.balls,
      strikes: gameState.strikes,
      fouls: gameState.fouls || 0,
      result,
      rbi: 0,
      errors: 0,
      timestamp: new Date()
    };
    
    // Log the player name lookup for debugging
    console.log('Selected player ID:', selectedPlayerId);
    console.log('Current inning (top/bottom):', isTopInning ? 'Top' : 'Bottom');
    console.log('Batting lineup:', isTopInning ? 'Team' : 'Opponent');
    console.log('Pitching lineup:', isTopInning ? 'Opponent' : 'Team');
    console.log('Found player name:', currentAtBat.playerName);
    
    // Handle different at-bat results
    if (result === 'homerun') {
      // Count runners on base (they all score on a home run)
      if (bases.first) currentAtBat.rbi++;
      if (bases.second) currentAtBat.rbi++;
      if (bases.third) currentAtBat.rbi++;
      
      // Add the batter's run
      currentAtBat.rbi++;
      
      // Clear the bases
      updatedGameState.bases = { first: null, second: null, third: null };
      
      console.log('Home run! RBI:', currentAtBat.rbi);
    } else if (result === 'triple') {
      // Count runners on base (they all score on a triple)
      if (bases.first) currentAtBat.rbi++;
      if (bases.second) currentAtBat.rbi++;
      if (bases.third) currentAtBat.rbi++;
      
      // Clear the bases and put the batter on third
      updatedGameState.bases = { first: null, second: null, third: selectedPlayerId };
      
      console.log('Triple! RBI:', currentAtBat.rbi);
    } else if (result === 'double') {
      // Runners on second and third score
      if (bases.second) currentAtBat.rbi++;
      if (bases.third) currentAtBat.rbi++;
      
      // Update the bases
      updatedGameState.bases = { third: bases.first, first: null, second: selectedPlayerId };
      
      console.log('Double! RBI:', currentAtBat.rbi);
    } else if (result === 'single' || result === 'walk' || result === 'hitByPitch') {
      // Only runner on third scores
      if (bases.third) currentAtBat.rbi++;
      
      // Update the bases
      updatedGameState.bases = { third: bases.second, second: bases.first, first: selectedPlayerId };
      
      console.log('Single/Walk! RBI:', currentAtBat.rbi);
    } else if (result === 'sacrifice') {
      // Runner on third scores on a sacrifice
      if (bases.third) {
        currentAtBat.rbi++;
      }
      
      // Update the bases (advance runners, batter is out)
      updatedGameState.bases = { third: bases.second, second: bases.first, first: null };
      
      // Add an out
      const updatedOuts = outs + 1;
      
      // Update game state
      updatedGameState = {
        ...gameState,
        currentInning,
        outs: updatedOuts,
        balls: 0,
        strikes: 0,
        fouls: 0,
        bases: updatedGameState.bases
      };
      
      console.log('Sacrifice! RBI:', currentAtBat.rbi);
    } else if (result === 'strikeout' || result === 'groundOut' || result === 'flyOut' || 
              result === 'outAtFirst' || result === 'outAtSecond' || 
              result === 'outAtThird' || result === 'outAtHome') {
      // All of these results are outs
      // No runners score, just add an out
      const updatedOuts = outs + 1;
      
      // Update game state
      updatedGameState = {
      ...gameState,
        currentInning,
        outs: updatedOuts,
      balls: 0,
      strikes: 0,
        fouls: 0,
        bases: updatedGameState.bases
      };
      
      console.log(result + '! Outs:', updatedOuts);
    } else if (result === 'foul') {
      // Foul balls are tracked but don't change the state unless handled by handleFoulClick
      // This case is for fouls with 2 strikes that get recorded as at-bat results
      console.log('Foul ball recorded with 2 strikes');
    }
    
    // Set the RBI count in the at-bat record
    currentAtBat.rbi = currentAtBat.rbi;
    
    // Update player stats
    const existingPlayerStats = Array.isArray(scoreDetails.playerStats) ? scoreDetails.playerStats : [];
    const otherPlayerStats = existingPlayerStats.filter(stat => stat.playerId !== selectedPlayerId);
    let currentBatterStats = existingPlayerStats.find(p => p.playerId === selectedPlayerId);
    if (!currentBatterStats) {
      currentBatterStats = {
        playerId: selectedPlayerId || '',
        playerName: currentBatter?.playerName || 'Unknown Player',
        position: currentBatter?.position || '',
        atBats: 0,
        hits: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        homeruns: 0,
        walks: 0,
        strikeouts: 0,
        rbi: 0,
        runs: 0,
        errors: 0
      };
    }
    
    // Update inning score if runs were scored
    let updatedInningScores: InningScore[] = [...(Array.isArray(scoreDetails.inningScores) ? scoreDetails.inningScores : [])];
    if (currentAtBat.rbi > 0) {
      const currentInningProperty = isTopInning ? 'team' : 'opponent';
      
      // Find the current inning score
      while (updatedInningScores.length < currentInning) {
        updatedInningScores.push({ team: 0, opponent: 0 });
      }
      
      // Update the score for the current inning
      if (updatedInningScores[currentInning - 1]) {
        updatedInningScores[currentInning - 1] = {
          ...updatedInningScores[currentInning - 1],
          [currentInningProperty]: (updatedInningScores[currentInning - 1][currentInningProperty] || 0) + currentAtBat.rbi
        };
      } else {
        // Create the current inning if it doesn't exist
        const newInningScore: InningScore = { team: 0, opponent: 0 };
        newInningScore[currentInningProperty] = currentAtBat.rbi;
        updatedInningScores[currentInning - 1] = newInningScore;
      }
    }
    
    // Update player stats in the score details
    const updatedPlayerStats = [...otherPlayerStats, {
      ...currentBatterStats,
      atBats: currentBatterStats.atBats + (result !== 'walk' && result !== 'hitByPitch' ? 1 : 0),
      hits: currentBatterStats.hits + (result === 'single' || result === 'double' || result === 'triple' || result === 'homerun' ? 1 : 0),
      singles: currentBatterStats.singles + (result === 'single' ? 1 : 0),
      doubles: currentBatterStats.doubles + (result === 'double' ? 1 : 0),
      triples: currentBatterStats.triples + (result === 'triple' ? 1 : 0),
      homeruns: currentBatterStats.homeruns + (result === 'homerun' ? 1 : 0),
      walks: currentBatterStats.walks + (result === 'walk' || result === 'hitByPitch' ? 1 : 0),
      strikeouts: currentBatterStats.strikeouts + (result === 'strikeout' ? 1 : 0),
      rbi: currentBatterStats.rbi + currentAtBat.rbi,
      runs: currentBatterStats.runs + (result === 'homerun' ? 1 : 0)
    }];
    
    // Find the next batter in the lineup before updating
    const nextBatter = selectNextBatter({ 
      currentLineup: isTopInning ? teamLineup : opponentLineup, 
      currentPlayerId: selectedPlayerId 
    });
    
    // Update the current batter in the game state if we found a next batter
    if (nextBatter) {
      // Immediately update the current batter ID in the component state
      setSelectedPlayerId(nextBatter.playerId);
      
      // Update the game state object
      updatedGameState.currentBatterId = nextBatter.playerId;
      console.log('Next batter selected:', nextBatter.playerName, 'ID:', nextBatter.playerId);
      console.log('Updated game state with next batter:', updatedGameState);
    } else {
      console.log('No next batter found!', { teamLineup, selectedPlayerId });
    }
    
    // Ensure atBats is an array and add the new at-bat
    const updatedAtBats = [...(Array.isArray(scoreDetails.atBats) ? scoreDetails.atBats : []), currentAtBat];
    
    // Log the final at-bat record with RBI values
    console.log('Final at-bat record with RBI values:', currentAtBat);
    console.log('About to call onScoreUpdate with updated at-bats. Total count:', updatedAtBats.length);
    console.log('Latest at-bat:', currentAtBat);
    
    // Check if we need to handle three outs
    const isThreeOuts = handleThreeOuts();
    
    if (!isThreeOuts) {
      // Continue with regular at-bat handling
      // Find the next batter in the lineup
      if (currentBattingLineup.length > 0) {
        const currentBatterIndex = currentBattingLineup.findIndex(p => p.playerId === selectedPlayerId);
        if (currentBatterIndex !== -1) {
          const nextBatterIndex = (currentBatterIndex + 1) % currentBattingLineup.length;
          const nextBatter = currentBattingLineup[nextBatterIndex];
          
          updatedGameState.currentBatterId = nextBatter.playerId;
          setSelectedPlayerId(nextBatter.playerId);
          console.log(`Next batter: ${nextBatter.playerName} (${nextBatterIndex + 1}/${currentBattingLineup.length})`);
        }
      }
      
      // Update the game state with the current at-bat result
      const updatedScoreDetails = {
      ...scoreDetails,
        atBats: updatedAtBats,
        gameState: updatedGameState,
      inningScores: updatedInningScores,
        playerStats: updatedPlayerStats
      };
      
      try {
        // Save to Firebase
        if (game.id) {
          console.log('Saving game data to Firebase...');
          const gameRef = doc(db, 'games', game.id);
          await updateDoc(gameRef, {
            scoreDetails: updatedScoreDetails,
            status: 'inProgress',
            updatedAt: new Date()
          });
          console.log('Game data saved to Firebase');
          toast.success('Game data saved');
        }
        
        // Update local state via callback
        onScoreUpdate(updatedScoreDetails);
        
        // Record the at-bat in parent component
        if (typeof onRecordAtBat === 'function') {
          onRecordAtBat(currentAtBat);
        }
        
      } catch (error) {
        console.error('Error saving game data to Firebase:', error);
        toast.error('Error saving game data');
        
        // Still update local state even if Firebase save fails
        onScoreUpdate(updatedScoreDetails);
        if (typeof onRecordAtBat === 'function') {
          onRecordAtBat(currentAtBat);
        }
      }
    }
    
    // Close modal if open
    setShowAtBatModal(false);
  };
  
  // Add this state for modal visibility
  const [stealAttemptModalOpen, setStealAttemptModalOpen] = useState(false);
  const [activeStealBase, setActiveStealBase] = useState<'first' | 'second' | 'third' | null>(null);
  const [runnerAdvancement, setRunnerAdvancement] = useState<Record<string, 'safe' | 'out' | null>>({
    first: null,
    second: null,
    third: null
  });

  // Function to handle stolen base attempt button click
  const openStealAttemptModal = (baseFrom: BaseType) => {
    setActiveStealBase(baseFrom);
    
    // Reset runner advancement selections
    setRunnerAdvancement({
      first: null,
      second: null,
      third: null
    });
    
    setStealAttemptModalOpen(true);
  };

  // Function to handle recording the stolen base results
  const handleRecordStolenBase = () => {
    if (!activeStealBase) return;
    
    // Store the original bases state to reference
    const originalBases = { ...gameState.bases };
    let updatedBases = { ...originalBases };
    let updatedOuts = gameState.outs;
    let runnerScored = false;
    
    // Process primary runner (the one who initiated the steal)
    const primaryRunnerId = originalBases[activeStealBase];
    const primaryOutcome = runnerAdvancement[activeStealBase] || 'safe'; // Default to safe
    
    if (primaryRunnerId) {
      // Clear the base they were on
      updatedBases[activeStealBase] = null;
      
      if (primaryOutcome === 'safe') {
        // Determine where they're going
        if (activeStealBase === 'first') {
          updatedBases.second = primaryRunnerId;
        } else if (activeStealBase === 'second') {
          updatedBases.third = primaryRunnerId;
        } else if (activeStealBase === 'third') {
          runnerScored = true;
          // Runner scores - handle this below
        }
      } else {
        // Runner is out
        updatedOuts += 1;
      }
      
      // Record the steal attempt in the game log
      recordStealAttempt(
        activeStealBase, 
        activeStealBase === 'first' ? 'second' : activeStealBase === 'second' ? 'third' : 'home',
        primaryOutcome,
        primaryRunnerId
      );
    }
    
    // Process other runners advancing
    Object.entries(runnerAdvancement).forEach(([base, outcome]) => {
      if (base === activeStealBase || !outcome) return; // Skip primary runner or unselected outcomes
      
      const baseType = base as BaseType;
      const runnerId = originalBases[baseType];
      
      if (runnerId) {
        // Clear the base they were on
        updatedBases[baseType] = null;
        
        if (outcome === 'safe') {
          // Determine where they're going
          if (baseType === 'first') {
            updatedBases.second = runnerId;
          } else if (baseType === 'second') {
            updatedBases.third = runnerId;
          } else if (baseType === 'third') {
            runnerScored = true;
            // Runner scores - handle this below
          }
        } else {
          // Runner is out
          updatedOuts += 1;
        }
        
        // Record the steal attempt in the game log
        recordStealAttempt(
          baseType, 
          baseType === 'first' ? 'second' : baseType === 'second' ? 'third' : 'home',
          outcome,
          runnerId
        );
      }
    });
    
    // Update score if any runner scored
    let updatedInningScores = [...scoreDetails.inningScores];
    if (runnerScored) {
      updatedInningScores = updateScoreOnStolenHome();
    }
    
    // Check if this was the third out
    if (updatedOuts >= 3) {
      const newIsTopInning = !gameState.isTopInning;
      const newInning = newIsTopInning ? gameState.currentInning + 1 : gameState.currentInning;
      
    const updatedGameState = {
      ...gameState,
        currentInning: newInning,
        isTopInning: newIsTopInning,
        outs: 0,
      balls: 0,
      strikes: 0,
        bases: {
          first: null,
          second: null,
          third: null
        }
      };
      
      onScoreUpdate({
        ...scoreDetails,
        gameState: updatedGameState
      });
      
      setStealAttemptModalOpen(false);
      return;
    }
    
    // Update game state
    const updatedGameState = {
      ...gameState,
      bases: updatedBases,
      outs: updatedOuts
    };
    
    onScoreUpdate({
      ...scoreDetails,
      gameState: updatedGameState,
      inningScores: updatedInningScores
    });
    
    setStealAttemptModalOpen(false);
  };

  // Add this function for recording steal attempts in the game log
  const recordStealAttempt = (
    baseFrom: BaseType,
    baseTo: BaseType | 'home',
    outcome: StealOutcome,
    runnerId: string
  ) => {
    // Get player name
    const runnerName = getPlayerNameById(runnerId) || 'Unknown Player';
    
    // Use the existing selectedPitcherId and get the pitcher name
    const pitcherName = getPlayerNameById(selectedPitcherId || '') || 'Unknown Pitcher';
    
    const atBatEntry: AtBat = {
      id: nanoid(),
      playerId: runnerId,
      playerName: runnerName,
      inning: gameState.currentInning,
      isTopInning: gameState.isTopInning,
      pitcherId: selectedPitcherId || '',
      pitcherName: pitcherName, // Use the pitcher name retrieved from selectedPitcherId
      balls: gameState.balls,
      strikes: gameState.strikes,
      fouls: gameState.fouls,
      result: outcome === 'safe' ? 'stolenBase' : 'caughtStealing',
      rbi: 0,
      errors: 0,
      timestamp: new Date(),
      baseStealDetails: {
        from: baseFrom,
        to: baseTo
      }
    };
    
    // Add to game log
    const updatedAtBats = [...scoreDetails.atBats, atBatEntry];
    
    console.log(`Recorded ${outcome === 'safe' ? 'stolen base' : 'caught stealing'} for ${runnerName}`);
    
    return updatedAtBats;
  };

  // Helper function to get player name by ID
  const getPlayerNameById = (playerId: string) => {
    // Check in current lineup
    const currentLineup = gameState.isTopInning ? teamLineup : opponentLineup;
    const player = currentLineup.find(p => p.playerId === playerId);
    if (player) return player.playerName;
    
    // Check in other lineup
    const otherLineup = gameState.isTopInning ? opponentLineup : teamLineup;
    const otherPlayer = otherLineup.find(p => p.playerId === playerId);
    return otherPlayer?.playerName;
  };

  // Add this function for updating score when stealing home
  const updateScoreOnStolenHome = () => {
    // Get the current inning score
    const currentInningIndex = gameState.currentInning - 1;
    let updatedInningScores = [...scoreDetails.inningScores];
    
    // Ensure the inning exists in our array
    while (updatedInningScores.length <= currentInningIndex) {
      updatedInningScores.push({ team: 0, opponent: 0 });
    }
    
    const currentInningScore = { ...updatedInningScores[currentInningIndex] };
    
    // Update the appropriate team's score
    if (gameState.isTopInning) {
      currentInningScore.team += 1;
    } else {
      currentInningScore.opponent += 1;
    }
    
    updatedInningScores[currentInningIndex] = currentInningScore;
    return updatedInningScores;
  };

  const renderAtBatResult = (atBat: AtBat) => {
    // Handle stolen base and caught stealing differently
    if (atBat.result === 'stolenBase' || atBat.result === 'caughtStealing') {
      const baseFrom = atBat.baseStealDetails?.from || '';
      const baseTo = atBat.baseStealDetails?.to || '';
      
      const fromBase = baseFrom === 'first' ? '1st' : baseFrom === 'second' ? '2nd' : '3rd';
      const toBase = baseTo === 'second' ? '2nd' : baseTo === 'third' ? '3rd' : 'Home';
      
      if (atBat.result === 'stolenBase') {
        return (
          <span className="text-green-600 dark:text-green-400 font-medium">
            {atBat.playerName} stole {toBase}
          </span>
        );
      } else {
        return (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {atBat.playerName} caught stealing {toBase}
          </span>
        );
      }
    }
    
    // Regular at-bat results
    switch (atBat.result) {
      case 'single':
        return <span className="text-green-600">Single</span>;
      case 'double':
        return <span className="text-green-600">Double</span>;
      case 'triple':
        return <span className="text-green-600">Triple</span>;
      case 'homerun':
        return <span className="text-green-600 font-bold">Home Run!</span>;
      case 'strikeout':
        return <span className="text-red-600">Strikeout</span>;
      case 'walk':
        return <span className="text-blue-600">Walk</span>;
      case 'hitByPitch':
        return <span className="text-blue-600">Hit By Pitch</span>;
      case 'sacrifice':
        return <span className="text-orange-600">Sacrifice</span>;
      case 'fieldersChoice':
        return <span className="text-orange-600">Fielder's Choice</span>;
      case 'error':
        return <span className="text-orange-600">Error</span>;
      case 'flyOut':
        return <span className="text-red-600">Fly Out</span>;
      case 'groundOut':
        return <span className="text-red-600">Ground Out</span>;
      case 'outAtFirst':
        return <span className="text-red-600">Out at 1st</span>;
      case 'outAtSecond':
        return <span className="text-red-600">Out at 2nd</span>;
      case 'outAtThird':
        return <span className="text-red-600">Out at 3rd</span>;
      case 'outAtHome':
        return <span className="text-red-600">Out at Home</span>;
      case 'foul':
        return <span className="text-yellow-600">Foul</span>;
      default:
        return <span>{atBat.result}</span>;
    }
  };

  // Group at-bats by inning and top/bottom
  const groupedAtBats: GroupedAtBats = scoreDetails.atBats.reduce((groups: GroupedAtBats, atBat) => {
    const key = `${atBat.inning}-${atBat.isTopInning ? 'top' : 'bottom'}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(atBat);
    return groups;
  }, {});

  // Convert grouped at-bats to array and sort in descending order
  const sortedGroups = Object.entries(groupedAtBats).sort((a, b) => {
    const [aInning, aHalf] = a[0].split('-');
    const [bInning, bHalf] = b[0].split('-');
    
    // First sort by inning (descending)
    const inningDiff = parseInt(bInning) - parseInt(aInning);
    if (inningDiff !== 0) return inningDiff;
    
    // For the same inning, show bottom before top
    if (bHalf === 'bottom' && aHalf === 'top') return 1;
    if (bHalf === 'top' && aHalf === 'bottom') return -1;
    
    return 0;
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Main Scoreboard */}
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Your Team</p>
            <p className="text-3xl font-bold">{totalTeamScore}</p>
          </div>
          <div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">Inning</p>
            <p className="text-xl font-bold text-center">
              {isTopInning ? 'Top' : 'Bottom'} {currentInning}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Opponent</p>
            <p className="text-3xl font-bold">{totalOpponentScore}</p>
          </div>
        </div>
        
        {/* Inning Scores */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="py-2 px-1 text-left">Team</th>
                {inningScores.map((_, index) => (
                  <th key={index} className="py-2 px-2 text-center w-8">{index + 1}</th>
                ))}
                <th className="py-2 px-2 text-center">R</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-600">
                <td className="py-2 px-1 font-medium">{game.teamName}</td>
                {inningScores.map((inning, index) => (
                  <td key={index} className="py-2 px-2 text-center">{inning.team}</td>
                ))}
                <td className="py-2 px-2 text-center font-bold">{totalTeamScore}</td>
              </tr>
              <tr>
                <td className="py-2 px-1 font-medium">{game.opponent}</td>
                {inningScores.map((inning, index) => (
                  <td key={index} className="py-2 px-2 text-center">{inning.opponent}</td>
                ))}
                <td className="py-2 px-2 text-center font-bold">{totalOpponentScore}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Game State */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          {/* Outs */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Outs</p>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-4 h-4 rounded-full ${i < outs ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Count */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Count</p>
            <div className="flex gap-2 items-center">
              <span className="text-sm">{balls}-{strikes}</span>
              <span className="text-xs text-gray-500">(B-S)</span>
            </div>
          </div>
          
          {/* Bases */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bases</p>
            <div className="relative w-16 h-16">
              {/* Home plate */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border border-gray-400 rotate-45"></div>
              
              {/* First base */}
              <div 
                className={`absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-4 ${
                  bases && bases.first ? 'bg-blue-500' : 'bg-white'
                } border border-gray-400`}
              ></div>
              
              {/* Second base */}
              <div 
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 ${
                  bases && bases.second ? 'bg-blue-500' : 'bg-white'
                } border border-gray-400 rotate-45`}
              ></div>
              
              {/* Third base */}
              <div 
                className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-4 ${
                  bases && bases.third ? 'bg-blue-500' : 'bg-white'
                } border border-gray-400`}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Current At Bat */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">At Bat (Auto-selected from Lineup)</p>
            <p className="text-sm font-medium">Pitching (Auto-selected from Lineup)</p>
          </div>
          
          <div className="flex justify-between">
            <div className="flex-1 mr-2">
              <select
                value={selectedPlayerId || ''}
                onChange={(e) => {
                  const playerId = e.target.value;
                  setSelectedPlayerId(playerId);
                  
                  const updatedGameState = {
                    ...gameState,
                    currentBatterId: playerId
                  };
                  
                  onScoreUpdate({
                    ...scoreDetails,
                    gameState: updatedGameState
                  });
                }}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Batter</option>
                {getCurrentBattingLineup().map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {player.playerName} ({player.position})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 ml-2">
              <select
                value={selectedPitcherId || ''}
                onChange={(e) => {
                  const playerId = e.target.value;
                  setSelectedPitcherId(playerId);
                  
                  const updatedGameState = {
                    ...gameState,
                    currentPitcherId: playerId
                  };
                  
                  onScoreUpdate({
                    ...scoreDetails,
                    gameState: updatedGameState
                  });
                }}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Pitcher</option>
                {getCurrentPitchingLineup().map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {player.playerName} ({player.position})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={handleBallClick}
            className="py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md"
          >
            Ball
          </button>
          <button
            onClick={handleStrikeClick}
            className="py-2 px-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-md"
          >
            Strike
          </button>
          <button
            onClick={handleFoulClick}
            className="py-2 px-4 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded-md"
          >
            Foul
          </button>
        </div>
      </div>
      
      {/* At Bat Result Buttons - reorganized with all out types */}
      <div className="px-4 pb-4">
        <p className="text-lg font-medium mb-2 mt-4">At Bat Result</p>
        
        {/* Hits section */}
        <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 mt-3">Hits</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => handleAtBatResult('single')}
            className="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200 text-sm"
          >
            Single
          </button>
          <button
            onClick={() => handleAtBatResult('double')}
            className="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200 text-sm"
          >
            Double
          </button>
          <button
            onClick={() => handleAtBatResult('triple')}
            className="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200 text-sm"
          >
            Triple
          </button>
          <button
            onClick={() => handleAtBatResult('homerun')}
            className="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-200 text-sm"
          >
            Home Run
          </button>
        </div>
        
        {/* Outs section */}
        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1 mt-3">Outs</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => handleAtBatResult('groundOut')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Ground Out
          </button>
          <button
            onClick={() => handleAtBatResult('flyOut')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Fly Out
          </button>
          <button
            onClick={() => handleAtBatResult('strikeout')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Strikeout
          </button>
          <button
            onClick={() => handleAtBatResult('outAtFirst')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Out at 1st
          </button>
          <button
            onClick={() => handleAtBatResult('outAtSecond')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Out at 2nd
          </button>
          <button
            onClick={() => handleAtBatResult('outAtThird')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Out at 3rd
          </button>
          <button
            onClick={() => handleAtBatResult('outAtHome')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Out at Home
          </button>
          <button
            onClick={() => handleAtBatResult('sacrifice')}
            className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 text-sm"
          >
            Sacrifice
          </button>
        </div>
        
        {/* Other results */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1 mt-3">Other</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAtBatResult('walk')}
            className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-sm"
          >
            Walk
          </button>
          <button
            onClick={() => handleAtBatResult('hitByPitch')}
            className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-sm"
          >
            Hit By Pitch
          </button>
          <button
            onClick={() => handleAtBatResult('error')}
            className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-sm"
          >
            Error
          </button>
          <button
            onClick={() => handleAtBatResult('fieldersChoice')}
            className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-sm"
          >
            Fielder's Choice
          </button>
        </div>
      </div>
      
      {/* Add this section after the bases display */}
      {(gameState.bases.first || gameState.bases.second || gameState.bases.third) && (
        <div className="mt-4 border-t pt-3">
          <h3 className="text-md font-semibold mb-2">Base Advancement</h3>
          <div className="flex flex-wrap gap-2">
            {gameState.bases.first && (
              <button
                onClick={() => openStealAttemptModal('first')}
                className="py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md"
              >
                Steal 2nd
              </button>
            )}
            
            {gameState.bases.second && (
              <button
                onClick={() => openStealAttemptModal('second')}
                className="py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md"
              >
                Steal 3rd
              </button>
            )}
            
            {gameState.bases.third && (
              <button
                onClick={() => openStealAttemptModal('third')}
                className="py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md"
              >
                Steal Home
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stolen Base Modal */}
      {stealAttemptModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Stolen Base Attempt</h2>
              <button 
                onClick={() => setStealAttemptModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Primary runner outcome */}
            {activeStealBase && (
              <div className="mb-6 border-b pb-4">
                <h3 className="font-semibold mb-2">
                  {activeStealBase === 'first' ? 'Runner stealing second' : 
                   activeStealBase === 'second' ? 'Runner stealing third' : 
                   'Runner stealing home'}
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-purple-600"
                      checked={runnerAdvancement[activeStealBase] === 'safe'}
                      onChange={() => setRunnerAdvancement({...runnerAdvancement, [activeStealBase]: 'safe'})}
                    />
                    <span className="ml-2 text-green-600 dark:text-green-400 font-medium">Safe</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-5 w-5 text-purple-600"
                      checked={runnerAdvancement[activeStealBase] === 'out'}
                      onChange={() => setRunnerAdvancement({...runnerAdvancement, [activeStealBase]: 'out'})}
                    />
                    <span className="ml-2 text-red-600 dark:text-red-400 font-medium">Out</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Other runners advancing */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Other Base Runners</h3>
              
              {/* First base runner */}
              {activeStealBase !== 'first' && gameState.bases.first && (
                <div className="mb-3 pl-2 border-l-4 border-blue-300 dark:border-blue-700">
                  <h4 className="text-sm font-medium mb-1">Runner on First</h4>
                  <div className="flex items-center space-x-2 ml-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.first === 'safe'}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, first: 'safe'})}
                      />
                      <span className="ml-1 text-sm text-green-600 dark:text-green-400">Advances to Second</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.first === 'out'}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, first: 'out'})}
                      />
                      <span className="ml-1 text-sm text-red-600 dark:text-red-400">Out</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.first === null}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, first: null})}
                      />
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">Stays</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Second base runner */}
              {activeStealBase !== 'second' && gameState.bases.second && (
                <div className="mb-3 pl-2 border-l-4 border-blue-300 dark:border-blue-700">
                  <h4 className="text-sm font-medium mb-1">Runner on Second</h4>
                  <div className="flex items-center space-x-2 ml-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.second === 'safe'}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, second: 'safe'})}
                      />
                      <span className="ml-1 text-sm text-green-600 dark:text-green-400">Advances to Third</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.second === 'out'}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, second: 'out'})}
                      />
                      <span className="ml-1 text-sm text-red-600 dark:text-red-400">Out</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.second === null}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, second: null})}
                      />
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">Stays</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Third base runner */}
              {activeStealBase !== 'third' && gameState.bases.third && (
                <div className="mb-3 pl-2 border-l-4 border-blue-300 dark:border-blue-700">
                  <h4 className="text-sm font-medium mb-1">Runner on Third</h4>
                  <div className="flex items-center space-x-2 ml-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.third === 'safe'}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, third: 'safe'})}
                      />
                      <span className="ml-1 text-sm text-green-600 dark:text-green-400">Scores</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.third === 'out'}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, third: 'out'})}
                      />
                      <span className="ml-1 text-sm text-red-600 dark:text-red-400">Out</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={runnerAdvancement.third === null}
                        onChange={() => setRunnerAdvancement({...runnerAdvancement, third: null})}
                      />
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">Stays</span>
                    </label>
                  </div>
                </div>
              )}
              
              {(activeStealBase === 'first' && !gameState.bases.second && !gameState.bases.third) ||
               (activeStealBase === 'second' && !gameState.bases.first && !gameState.bases.third) ||
               (activeStealBase === 'third' && !gameState.bases.first && !gameState.bases.second) ? (
                 <p className="text-sm text-gray-500 dark:text-gray-400">No other runners on base</p>
               ) : null}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setStealAttemptModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordStolenBase}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Record Stolen Base
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Log */}
      <div className="mt-4 border-t pt-3">
        <h3 className="text-lg font-semibold mb-2">Game Log</h3>
        {sortedGroups.map(([key, atBats]) => {
          const [inning, half] = key.split('-');
          return (
            <div key={key} className="mb-4">
              <div className="bg-gray-100 dark:bg-gray-800 py-1 px-2 font-semibold">
                Inning {inning} - {half === 'top' ? 'Top' : 'Bottom'}
              </div>
              {/* Show at-bats in reverse order within each inning */}
              {[...atBats].reverse().map((atBat) => (
                <div 
                  key={atBat.id} 
                  className={`p-2 border-b ${
                    atBat.result === 'stolenBase' || atBat.result === 'caughtStealing' 
                      ? 'bg-blue-50 dark:bg-blue-900/30' 
                      : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {atBat.result === 'stolenBase' || atBat.result === 'caughtStealing' 
                        ? '⚡ Base Running' 
                        : atBat.playerName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {atBat.inning}{atBat.isTopInning ? '▲' : '▼'} 
                    </span>
                  </div>
                  <div>
                    {renderAtBatResult(atBat)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {atBat.result === 'stolenBase' || atBat.result === 'caughtStealing' 
                      ? `Pitcher: ${atBat.pitcherName} • ${new Date(atBat.timestamp).toLocaleTimeString()}`
                      : `${atBat.balls}-${atBat.strikes}, ${new Date(atBat.timestamp).toLocaleTimeString()}`}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 