import React from 'react';
import { Game, GameScoreDetails } from '../../../types/game';

interface GameSummaryProps {
  game: Game;
  scoreDetails: GameScoreDetails;
}

export const GameSummary: React.FC<GameSummaryProps> = ({ game, scoreDetails }) => {
  // Calculate total score
  const calculateScore = () => {
    let teamScore = 0;
    let opponentScore = 0;
    
    if (scoreDetails?.inningScores && Array.isArray(scoreDetails.inningScores)) {
      scoreDetails.inningScores.forEach(inning => {
        teamScore += inning.team;
        opponentScore += inning.opponent;
      });
    }
    
    return { teamScore, opponentScore };
  };
  
  const { teamScore, opponentScore } = calculateScore();
  
  // Calculate team stats
  const calculateTeamStats = () => {
    // Ensure playerStats is an array
    const playerStats = Array.isArray(scoreDetails?.playerStats) ? scoreDetails.playerStats : [];
    const lineup = game.lineup || { team: [], opponent: [] };
    
    const teamStats = playerStats.filter(player => {
      // Ensure team lineup is available and is an array
      if (!Array.isArray(lineup.team)) return false;
      return lineup.team.some(p => p.playerId === player.playerId);
    });
    
    const opponentStats = playerStats.filter(player => {
      // Ensure opponent lineup is available and is an array
      if (!Array.isArray(lineup.opponent)) return false;
      return lineup.opponent.some(p => p.playerId === player.playerId);
    });
    
    // Define a type-safe version of reduce
    const safeReduce = <T, U>(
      array: T[] | undefined | null,
      callback: (accumulator: U, currentValue: T) => U,
      initialValue: U
    ): U => {
      if (!Array.isArray(array)) return initialValue;
      return array.reduce(callback, initialValue);
    };
    
    return {
      team: {
        atBats: safeReduce(teamStats, (sum, player) => sum + player.atBats, 0),
        hits: safeReduce(teamStats, (sum, player) => sum + player.hits, 0),
        runs: safeReduce(teamStats, (sum, player) => sum + player.runs, 0),
        rbi: safeReduce(teamStats, (sum, player) => sum + player.rbi, 0),
        walks: safeReduce(teamStats, (sum, player) => sum + player.walks, 0),
        strikeouts: safeReduce(teamStats, (sum, player) => sum + player.strikeouts, 0),
        errors: safeReduce(teamStats, (sum, player) => sum + player.errors, 0),
        avg: safeReduce(teamStats, (sum, player) => sum + player.hits, 0) / 
             Math.max(1, safeReduce(teamStats, (sum, player) => sum + player.atBats, 0))
      },
      opponent: {
        atBats: safeReduce(opponentStats, (sum, player) => sum + player.atBats, 0),
        hits: safeReduce(opponentStats, (sum, player) => sum + player.hits, 0),
        runs: safeReduce(opponentStats, (sum, player) => sum + player.runs, 0),
        rbi: safeReduce(opponentStats, (sum, player) => sum + player.rbi, 0),
        walks: safeReduce(opponentStats, (sum, player) => sum + player.walks, 0),
        strikeouts: safeReduce(opponentStats, (sum, player) => sum + player.strikeouts, 0),
        errors: safeReduce(opponentStats, (sum, player) => sum + player.errors, 0),
        avg: safeReduce(opponentStats, (sum, player) => sum + player.hits, 0) / 
             Math.max(1, safeReduce(opponentStats, (sum, player) => sum + player.atBats, 0))
      }
    };
  };
  
  const teamStats = calculateTeamStats();
  
  // Format batting average
  const formatAvg = (avg: number) => {
    return avg.toFixed(3).replace(/^0+/, '');
  };
  
  // Determine game result
  const getGameResult = () => {
    if (teamScore > opponentScore) {
      return `${game.teamName} won`;
    } else if (opponentScore > teamScore) {
      return `${game.opponent} won`;
    } else {
      return 'Game tied';
    }
  };
  
  // Get game duration
  const getGameDuration = () => {
    if (!Array.isArray(scoreDetails?.atBats) || scoreDetails.atBats.length === 0) return 'N/A';
    
    const firstAtBat = scoreDetails.atBats[0];
    const lastAtBat = scoreDetails.atBats[scoreDetails.atBats.length - 1];
    
    if (!firstAtBat?.timestamp || !lastAtBat?.timestamp) return 'N/A';
    
    const startTime = new Date(firstAtBat.timestamp);
    const endTime = new Date(lastAtBat.timestamp);
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Game Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Game Summary</h2>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-sm font-medium">{game.teamName}</p>
            <p className="text-3xl font-bold">{teamScore}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">Final</p>
            <p className="text-lg">{getGameResult()}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium">{game.opponent}</p>
            <p className="text-3xl font-bold">{opponentScore}</p>
          </div>
        </div>
      </div>
      
      {/* Game Details */}
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium mb-3">Game Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-1">
              <span className="font-medium">Date:</span>{' '}
              {game.startDate ? new Date(game.startDate).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Location:</span> {game.location || 'N/A'}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Duration:</span> {getGameDuration()}
            </p>
          </div>
          <div>
            <p className="text-sm mb-1">
              <span className="font-medium">Innings:</span>{' '}
              {Array.isArray(scoreDetails?.inningScores) ? scoreDetails.inningScores.length : 'N/A'}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">At-Bats:</span>{' '}
              {Array.isArray(scoreDetails?.atBats) ? scoreDetails.atBats.length : 'N/A'}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Status:</span>{' '}
              {game.status === 'completed' ? 'Completed' : 'In Progress'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Team Stats Comparison */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-3">Team Stats</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="py-2 px-2 text-left">Team</th>
                <th className="py-2 px-2 text-center">AB</th>
                <th className="py-2 px-2 text-center">R</th>
                <th className="py-2 px-2 text-center">H</th>
                <th className="py-2 px-2 text-center">RBI</th>
                <th className="py-2 px-2 text-center">BB</th>
                <th className="py-2 px-2 text-center">SO</th>
                <th className="py-2 px-2 text-center">E</th>
                <th className="py-2 px-2 text-center">AVG</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-600">
                <td className="py-2 px-2 font-medium">{game.teamName}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.atBats}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.runs}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.hits}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.rbi}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.walks}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.strikeouts}</td>
                <td className="py-2 px-2 text-center">{teamStats.team.errors}</td>
                <td className="py-2 px-2 text-center">{formatAvg(teamStats.team.avg)}</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-medium">{game.opponent}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.atBats}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.runs}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.hits}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.rbi}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.walks}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.strikeouts}</td>
                <td className="py-2 px-2 text-center">{teamStats.opponent.errors}</td>
                <td className="py-2 px-2 text-center">{formatAvg(teamStats.opponent.avg)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Game Notes */}
      {game.notes && (
        <div className="p-4 border-t dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2">Game Notes</h3>
          <p className="text-sm">{game.notes}</p>
        </div>
      )}
    </div>
  );
}; 