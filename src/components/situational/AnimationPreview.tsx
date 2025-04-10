import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Position, ScenarioAnimation } from '../../types/situational';

interface Props {
  positions: Position[];
  animation: ScenarioAnimation;
  onComplete?: () => void;
}

export const AnimationPreview: React.FC<Props> = ({ positions, animation, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPositions, setCurrentPositions] = useState<Position[]>([...positions]);
  const animationRef = useRef<number>();

  const startAnimation = () => {
    setIsPlaying(true);
    const startTime = Date.now() - currentTime * 1000;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      if (elapsed >= animation.duration) {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentPositions([...positions]);
        onComplete?.();
        return;
      }

      // Update positions based on keyframes
      const updatedPositions = [...positions];
      animation.animations.forEach(({ positionId, keyframes }) => {
        // Find keyframes that bracket the current time
        const currentFrame = keyframes.reduce((prev, curr) => {
          if (curr.timestamp / 1000 <= elapsed) return curr;
          return prev;
        }, keyframes[0]);

        if (currentFrame) {
          updatedPositions[positionId] = {
            ...updatedPositions[positionId],
            x: currentFrame.x,
            y: currentFrame.y
          };
        }
      });

      setCurrentPositions(updatedPositions);
      setCurrentTime(elapsed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    setCurrentTime(0);
    setCurrentPositions([...positions]);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Field Background */}
        <rect x="0" y="0" width="100" height="100" fill="#8B9A46" />
        
        {/* Infield Dirt */}
        <path
          d="M50,20 L80,50 L50,80 L20,50 Z"
          fill="#B87333"
          stroke="#8B4513"
          strokeWidth="0.5"
        />

        {/* Base Lines */}
        <line x1="50" y1="20" x2="80" y2="50" stroke="white" strokeWidth="0.5" />
        <line x1="80" y1="50" x2="50" y2="80" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="80" x2="20" y2="50" stroke="white" strokeWidth="0.5" />
        <line x1="20" y1="50" x2="50" y2="20" stroke="white" strokeWidth="0.5" />

        {/* Bases */}
        <rect x="48" y="18" width="4" height="4" fill="white" transform="rotate(45, 50, 20)" />
        <rect x="78" y="48" width="4" height="4" fill="white" transform="rotate(45, 80, 50)" />
        <rect x="48" y="48" width="4" height="4" fill="white" transform="rotate(45, 50, 50)" />
        <rect x="18" y="48" width="4" height="4" fill="white" transform="rotate(45, 20, 50)" />

        {/* Pitcher's Circle */}
        <circle cx="50" cy="50" r="5" fill="none" stroke="white" strokeWidth="0.5" />

        {/* Positions */}
        {currentPositions.map((pos, index) => (
          <g key={index} transform={`translate(${pos.x},${pos.y})`}>
            {pos.type === 'player' && (
              <circle r="3" fill="#2196F3" stroke="white" strokeWidth="0.5" />
            )}
            {pos.type === 'ball' && (
              <circle r="1.5" fill="white" stroke="#333" strokeWidth="0.5" />
            )}
            {pos.type === 'runner' && (
              <path d="M-2,-2 L2,2 M-2,2 L2,-2" stroke="#FF5722" strokeWidth="1" />
            )}
            {pos.type === 'batter' && (
              <g>
                <circle r="2" fill="#E91E63" stroke="white" strokeWidth="0.5" />
                <line x1="-2" y1="0" x2="2" y2="0" stroke="white" strokeWidth="0.5" transform="rotate(45)" />
              </g>
            )}
            {pos.label && (
              <text x="0" y="5" textAnchor="middle" fill="white" fontSize="3">
                {pos.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white rounded-lg shadow-lg px-4 py-2">
        <button
          onClick={isPlaying ? stopAnimation : startAnimation}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={resetAnimation}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <div className="text-sm text-gray-600">
          {currentTime.toFixed(1)}s / {animation.duration.toFixed(1)}s
        </div>
      </div>
    </div>
  );
};