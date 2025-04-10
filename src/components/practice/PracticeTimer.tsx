import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Clock, AlertCircle, X } from 'lucide-react';
import { Drill } from '../../types';

interface Props {
  drills: Drill[];
  warmup?: {
    enabled: boolean;
    duration: number;
  };
  onComplete?: () => void;
  onExit?: () => void;
}

export const PracticeTimer: React.FC<Props> = ({ drills, warmup, onComplete, onExit }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(-1); // -1 for warmup
  const [timeLeft, setTimeLeft] = useState(warmup?.enabled ? warmup.duration * 60 : drills[0]?.duration * 60);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Move to next drill
      const nextIndex = currentDrillIndex + 1;
      if (nextIndex < drills.length) {
        setCurrentDrillIndex(nextIndex);
        setTimeLeft(drills[nextIndex].duration * 60);
      } else {
        setIsRunning(false);
        onComplete?.();
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentDrillIndex, drills, onComplete]);

  const getCurrentActivity = () => {
    if (currentDrillIndex === -1) {
      return { name: 'Warmup', duration: warmup?.duration || 0 };
    }
    return drills[currentDrillIndex];
  };

  const getNextActivity = () => {
    if (currentDrillIndex === -1) {
      return drills[0];
    }
    return drills[currentDrillIndex + 1];
  };

  const handleSkip = () => {
    const nextIndex = currentDrillIndex + 1;
    if (nextIndex < drills.length) {
      setCurrentDrillIndex(nextIndex);
      setTimeLeft(drills[nextIndex].duration * 60);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentActivity = getCurrentActivity();
  const nextActivity = getNextActivity();
  const totalDuration = (warmup?.enabled ? warmup.duration : 0) + 
    drills.reduce((sum, drill) => sum + drill.duration, 0);
  const progress = (totalElapsed / (totalDuration * 60)) * 100;

  return (
    <div className="relative">
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Exit Timer"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Practice Timer</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>Total Time: {formatTimeLeft(totalElapsed)} / {totalDuration}:00</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Current: {currentActivity.name}
            </h3>
            <p className="text-gray-600">Time Left: {formatTimeLeft(timeLeft)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              {isRunning ? (
                <Pause className="w-6 h-6 text-gray-600" />
              ) : (
                <Play className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <button
              onClick={handleSkip}
              className="p-2 rounded-full hover:bg-gray-200"
              disabled={!nextActivity}
            >
              <SkipForward className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {timeLeft <= 60 && (
          <div className="flex items-center gap-2 text-red-600 mt-2">
            <AlertCircle className="w-5 h-5" />
            <span>Less than 1 minute remaining!</span>
          </div>
        )}
      </div>

      {nextActivity && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Up Next</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="font-medium text-gray-800">{nextActivity.name}</div>
            <div className="text-sm text-gray-600">Duration: {nextActivity.duration} minutes</div>
            <div className="mt-2 text-sm text-gray-600">{nextActivity.shortDescription}</div>
          </div>
        </div>
      )}
    </div>
  );
};