import React from 'react';
import { Game, GameScoreDetails, PlayerGameStats } from '../../../types/game';

interface BoxScoreProps {
  game: Game;
  scoreDetails: GameScoreDetails;
}

export const BoxScore: React.FC<BoxScoreProps> = ({ game, scoreDetails }) => {
  // Ensure playerStats is an array
  const playerStats = Array.isArray(scoreDetails?.playerStats) ? scoreDetails.playerStats : [];
  
  // Group player stats by team
  const teamStats = playerStats.filter(player => {
    if (!Array.isArray(game.lineup?.team)) return false;
    return game.lineup.team.some(p => p.playerId === player.playerId);
  });
  
  const opponentStats = playerStats.filter(player => {
    if (!Array.isArray(game.lineup?.opponent)) return false;
    return game.lineup.opponent.some(p => p.playerId === player.playerId);
  });
  
  // Calculate batting average
  const calculateAvg = (stats: PlayerGameStats) => {
    if (stats.atBats === 0) return '.000';
    const avg = stats.hits / stats.atBats;
    return avg.toFixed(3).replace(/^0+/, '');
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Team Box Score */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{game.teamName}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="py-2 px-2 text-left">Player</th>
                <th className="py-2 px-2 text-center">Pos</th>
                <th className="py-2 px-2 text-center">AB</th>
                <th className="py-2 px-2 text-center">R</th>
                <th className="py-2 px-2 text-center">H</th>
                <th className="py-2 px-2 text-center">RBI</th>
                <th className="py-2 px-2 text-center">BB</th>
                <th className="py-2 px-2 text-center">SO</th>
                <th className="py-2 px-2 text-center">AVG</th>
              </tr>
            </thead>
            <tbody>
              {teamStats.length > 0 ? (
                teamStats.map((player) => (
                  <tr key={player.playerId} className="border-b dark:border-gray-600">
                    <td className="py-2 px-2">{player.playerName}</td>
                    <td className="py-2 px-2 text-center">{player.position || '-'}</td>
                    <td className="py-2 px-2 text-center">{player.atBats}</td>
                    <td className="py-2 px-2 text-center">{player.runs}</td>
                    <td className="py-2 px-2 text-center">{player.hits}</td>
                    <td className="py-2 px-2 text-center">{player.rbi}</td>
                    <td className="py-2 px-2 text-center">{player.walks}</td>
                    <td className="py-2 px-2 text-center">{player.strikeouts}</td>
                    <td className="py-2 px-2 text-center">{calculateAvg(player)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-500">
                    No player statistics available
                  </td>
                </tr>
              )}
            </tbody>
            {teamStats.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                  <td className="py-2 px-2">Team Totals</td>
                  <td className="py-2 px-2 text-center"></td>
                  <td className="py-2 px-2 text-center">
                    {teamStats.reduce((sum, player) => sum + player.atBats, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {teamStats.reduce((sum, player) => sum + player.runs, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {teamStats.reduce((sum, player) => sum + player.hits, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {teamStats.reduce((sum, player) => sum + player.rbi, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {teamStats.reduce((sum, player) => sum + player.walks, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {teamStats.reduce((sum, player) => sum + player.strikeouts, 0)}
                  </td>
                  <td className="py-2 px-2 text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      {/* Opponent Box Score */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">{game.opponent}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-600">
                <th className="py-2 px-2 text-left">Player</th>
                <th className="py-2 px-2 text-center">Pos</th>
                <th className="py-2 px-2 text-center">AB</th>
                <th className="py-2 px-2 text-center">R</th>
                <th className="py-2 px-2 text-center">H</th>
                <th className="py-2 px-2 text-center">RBI</th>
                <th className="py-2 px-2 text-center">BB</th>
                <th className="py-2 px-2 text-center">SO</th>
                <th className="py-2 px-2 text-center">AVG</th>
              </tr>
            </thead>
            <tbody>
              {opponentStats.length > 0 ? (
                opponentStats.map((player) => (
                  <tr key={player.playerId} className="border-b dark:border-gray-600">
                    <td className="py-2 px-2">{player.playerName}</td>
                    <td className="py-2 px-2 text-center">{player.position || '-'}</td>
                    <td className="py-2 px-2 text-center">{player.atBats}</td>
                    <td className="py-2 px-2 text-center">{player.runs}</td>
                    <td className="py-2 px-2 text-center">{player.hits}</td>
                    <td className="py-2 px-2 text-center">{player.rbi}</td>
                    <td className="py-2 px-2 text-center">{player.walks}</td>
                    <td className="py-2 px-2 text-center">{player.strikeouts}</td>
                    <td className="py-2 px-2 text-center">{calculateAvg(player)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-500">
                    No player statistics available
                  </td>
                </tr>
              )}
            </tbody>
            {opponentStats.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                  <td className="py-2 px-2">Team Totals</td>
                  <td className="py-2 px-2 text-center"></td>
                  <td className="py-2 px-2 text-center">
                    {opponentStats.reduce((sum, player) => sum + player.atBats, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {opponentStats.reduce((sum, player) => sum + player.runs, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {opponentStats.reduce((sum, player) => sum + player.hits, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {opponentStats.reduce((sum, player) => sum + player.rbi, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {opponentStats.reduce((sum, player) => sum + player.walks, 0)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {opponentStats.reduce((sum, player) => sum + player.strikeouts, 0)}
                  </td>
                  <td className="py-2 px-2 text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      {/* Extra Stats Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-3">Extra-Base Hits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">{game.teamName}</h4>
            <ul className="text-sm">
              <li className="mb-1">
                <span className="font-medium">Doubles:</span>{' '}
                {teamStats.reduce((sum, player) => sum + (player.doubles || 0), 0)}
              </li>
              <li className="mb-1">
                <span className="font-medium">Triples:</span>{' '}
                {teamStats.reduce((sum, player) => sum + (player.triples || 0), 0)}
              </li>
              <li className="mb-1">
                <span className="font-medium">Home Runs:</span>{' '}
                {teamStats.reduce((sum, player) => sum + (player.homeruns || 0), 0)}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">{game.opponent}</h4>
            <ul className="text-sm">
              <li className="mb-1">
                <span className="font-medium">Doubles:</span>{' '}
                {opponentStats.reduce((sum, player) => sum + (player.doubles || 0), 0)}
              </li>
              <li className="mb-1">
                <span className="font-medium">Triples:</span>{' '}
                {opponentStats.reduce((sum, player) => sum + (player.triples || 0), 0)}
              </li>
              <li className="mb-1">
                <span className="font-medium">Home Runs:</span>{' '}
                {opponentStats.reduce((sum, player) => sum + (player.homeruns || 0), 0)}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 