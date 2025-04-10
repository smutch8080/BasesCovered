import React, { useState } from 'react';
import { AtBat, AtBatResult } from '../../../types/game';

interface PlayerInfo {
  playerId: string;
  name: string;
}

interface AtBatTrackerProps {
  currentBatter: PlayerInfo | null;
  currentPitcher: PlayerInfo | null;
  onAtBatComplete: (atBat: AtBat) => void;
  onCancel: () => void;
}

export const AtBatTracker: React.FC<AtBatTrackerProps> = ({
  currentBatter,
  currentPitcher,
  onAtBatComplete,
  onCancel
}) => {
  const [result, setResult] = useState<AtBatResult | null>(null);
  const [rbi, setRbi] = useState(0);
  const [basesAdvanced, setBasesAdvanced] = useState(0);
  const [notes, setNotes] = useState('');

  if (!currentBatter || !currentPitcher) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <p className="text-center text-gray-500">No batter or pitcher selected</p>
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-md"
        >
          Cancel
        </button>
      </div>
    );
  }

  const handleResultSelect = (selectedResult: AtBatResult) => {
    setResult(selectedResult);
    
    // Auto-set default RBI and bases advanced based on result
    switch (selectedResult) {
      case 'single':
        setBasesAdvanced(1);
        break;
      case 'double':
        setBasesAdvanced(2);
        break;
      case 'triple':
        setBasesAdvanced(3);
        break;
      case 'homerun':
        setBasesAdvanced(4);
        setRbi(1); // At least the batter scores
        break;
      default:
        setBasesAdvanced(0);
        setRbi(0);
    }
  };

  const handleSubmit = () => {
    if (!result) return;
    
    // Create a partial AtBat object with the required fields
    const atBat: Partial<AtBat> = {
      id: `${Date.now()}`, // Generate a temporary ID
      playerId: currentBatter.playerId,
      playerName: currentBatter.name,
      inning: 1, // Default values, should be provided by parent component
      isTopInning: true,
      pitcherId: currentPitcher.playerId,
      pitcherName: currentPitcher.name,
      balls: 0,
      strikes: 0,
      fouls: 0,
      result,
      rbi,
      errors: 0,
      timestamp: new Date()
    };
    
    onAtBatComplete(atBat as AtBat);
  };

  // Group at-bat results by category
  const hitResults: AtBatResult[] = ['single', 'double', 'triple', 'homerun'];
  const outResults: AtBatResult[] = ['groundOut', 'flyOut', 'strikeout', 'sacrifice', 'fieldersChoice', 'outAtFirst', 'outAtSecond', 'outAtThird', 'outAtHome'];
  const otherResults: AtBatResult[] = ['walk', 'hitByPitch', 'error'];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">At Bat</h2>
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-medium">Batter:</p>
            <p>{currentBatter.name}</p>
          </div>
          <div>
            <p className="font-medium">Pitcher:</p>
            <p>{currentPitcher.name}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Result</h3>
        
        {/* Hit Results */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Hits</p>
          <div className="flex flex-wrap gap-2">
            {hitResults.map((hitResult) => (
              <button
                key={hitResult}
                onClick={() => handleResultSelect(hitResult)}
                className={`py-1 px-3 text-sm rounded-full ${
                  result === hitResult
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {hitResult.charAt(0).toUpperCase() + hitResult.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Out Results */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Outs</p>
          <div className="flex flex-wrap gap-2">
            {outResults.map((outResult) => (
              <button
                key={outResult}
                onClick={() => handleResultSelect(outResult)}
                className={`py-1 px-3 text-sm rounded-full ${
                  result === outResult
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {outResult
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        
        {/* Other Results */}
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">Other</p>
          <div className="flex flex-wrap gap-2">
            {otherResults.map((otherResult) => (
              <button
                key={otherResult}
                onClick={() => handleResultSelect(otherResult)}
                className={`py-1 px-3 text-sm rounded-full ${
                  result === otherResult
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {otherResult
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Additional Details */}
      {result && (
        <div className="space-y-4">
          {/* RBI Counter */}
          <div>
            <label className="block text-sm font-medium mb-1">RBI</label>
            <div className="flex items-center">
              <button
                onClick={() => setRbi(Math.max(0, rbi - 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-l-md"
                disabled={rbi === 0}
              >
                -
              </button>
              <div className="w-12 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-t border-b dark:border-gray-600">
                {rbi}
              </div>
              <button
                onClick={() => setRbi(rbi + 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-r-md"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Bases Advanced Counter (for hits) */}
          {['single', 'double', 'triple', 'homerun'].includes(result) && (
            <div>
              <label className="block text-sm font-medium mb-1">Bases Advanced</label>
              <div className="flex items-center">
                <button
                  onClick={() => setBasesAdvanced(Math.max(0, basesAdvanced - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-l-md"
                  disabled={basesAdvanced === 0}
                >
                  -
                </button>
                <div className="w-12 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-t border-b dark:border-gray-600">
                  {basesAdvanced}
                </div>
                <button
                  onClick={() => setBasesAdvanced(basesAdvanced + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-r-md"
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              rows={2}
              placeholder="Optional notes about this at-bat..."
            />
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!result}
          className={`flex-1 py-2 px-4 rounded-md ${
            result
              ? 'bg-blue-500 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Record
        </button>
      </div>
    </div>
  );
}; 