import React, { useState, useRef, useEffect } from 'react';
import { Circle, ArrowRight, X, Trash2, Play } from 'lucide-react';
import { Position, ScenarioAnimation } from '../../types/situational';
import { AnimationPreview } from './AnimationPreview';
import toast from 'react-hot-toast';

// Default field positions
const DEFAULT_POSITIONS: Position[] = [
  { x: 50, y: 50, type: 'player', label: 'P' },  // Pitcher
  { x: 50, y: 88, type: 'player', label: 'C' },  // Catcher
  { x: 70, y: 50, type: 'player', label: '1B' }, // First Base
  { x: 60, y: 35, type: 'player', label: '2B' }, // Second Base
  { x: 40, y: 35, type: 'player', label: 'SS' }, // Short Stop
  { x: 30, y: 50, type: 'player', label: '3B' }, // Third Base
  { x: 20, y: 30, type: 'player', label: 'LF' }, // Left Field
  { x: 50, y: 5, type: 'player', label: 'CF' }, // Center Field
  { x: 80, y: 30, type: 'player', label: 'RF' }  // Right Field
];

interface Props {
  positions: Position[];
  onPositionChange: (positions: Position[]) => void;
  isEditable?: boolean;
  onAnimationRecorded?: (animation: ScenarioAnimation) => void;
}

const Field: React.FC<Props> = ({ 
  positions, 
  onPositionChange, 
  isEditable = true,
  onAnimationRecorded 
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recordedAnimation, setRecordedAnimation] = useState<ScenarioAnimation | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const recordingStartTime = useRef<number | null>(null);
  const animationFrames = useRef<Map<number, { x: number; y: number; timestamp: number }[]>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);

  // Initialize with default positions if no positions are provided
  useEffect(() => {
    if (positions.length === 0) {
      onPositionChange(DEFAULT_POSITIONS);
    }
  }, []);

  const handleAddPosition = (type: 'player' | 'ball' | 'runner' | 'batter') => {
    // Check if batter already exists
    if (type === 'batter' && positions.some(p => p.type === 'batter')) {
      toast.error('Only one batter can be added');
      return;
    }

    // Set default positions based on type
    let x = 50;
    let y = 50;
    let label;

    switch (type) {
      case 'batter':
        x = 47;
        y = 85;
        label = 'B';
        break;
      case 'runner':
        x = 80;
        y = 50;
        label = 'R';
        break;
      case 'player':
        label = `P${positions.filter(p => p.type === 'player').length + 1}`;
        break;
    }

    const newPosition: Position = { x, y, type, label };
    onPositionChange([...positions, newPosition]);
  };

  const handleDragStart = (index: number, e: React.MouseEvent) => {
    if (!isEditable) {
      e.preventDefault();
      return;
    }
    setSelectedPosition(index);
    setIsDragging(true);
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
  };

  const handleDragEnd = () => {
    if (selectedPosition !== null && isDragging) {
      // Check if position is over trash zone
      const trashZone = trashZoneRef.current?.getBoundingClientRect();
      const svg = svgRef.current?.getBoundingClientRect();
      
      if (trashZone && svg) {
        const position = positions[selectedPosition];
        const posX = (position.x / 100) * svg.width + svg.left;
        const posY = (position.y / 100) * svg.height + svg.top;

        if (
          posX >= trashZone.left &&
          posX <= trashZone.right &&
          posY >= trashZone.top &&
          posY <= trashZone.bottom
        ) {
          // Remove the position
          const updatedPositions = positions.filter((_, i) => i !== selectedPosition);
          onPositionChange(updatedPositions);
        }
      }
    }

    setSelectedPosition(null);
    setIsDragging(false);
    // Restore text selection
    document.body.style.userSelect = '';
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || selectedPosition === null || !isEditable) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedPositions = [...positions];
    updatedPositions[selectedPosition] = {
      ...updatedPositions[selectedPosition],
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };

    onPositionChange(updatedPositions);

    // Record frame if recording
    if (isRecording && recordingStartTime.current !== null) {
      const timestamp = Date.now() - recordingStartTime.current;
      const frames = animationFrames.current.get(selectedPosition) || [];
      frames.push({ x, y, timestamp });
      animationFrames.current.set(selectedPosition, frames);
    }
  };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (!isEditable) {
      e.preventDefault();
      return;
    }
    // Prevent page scrolling
    e.preventDefault();
    setSelectedPosition(index);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging || selectedPosition === null || !isEditable) return;
    e.preventDefault(); // Prevent scrolling while dragging

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    const updatedPositions = [...positions];
    updatedPositions[selectedPosition] = {
      ...updatedPositions[selectedPosition],
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };

    onPositionChange(updatedPositions);

    // Record frame if recording
    if (isRecording && recordingStartTime.current !== null) {
      const timestamp = Date.now() - recordingStartTime.current;
      const frames = animationFrames.current.get(selectedPosition) || [];
      frames.push({ x, y, timestamp });
      animationFrames.current.set(selectedPosition, frames);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    recordingStartTime.current = Date.now();
    animationFrames.current.clear();
  };

  const handleStopRecording = () => {
    if (!recordingStartTime.current) return;

    const duration = (Date.now() - recordingStartTime.current) / 1000;
    const animations = Array.from(animationFrames.current.entries())
      .filter(([_, frames]) => frames.length > 0)
      .map(([positionId, frames]) => ({
        positionId,
        keyframes: frames.map(frame => ({
          x: frame.x,
          y: frame.y,
          timestamp: frame.timestamp
        }))
      }));

    if (animations.length > 0) {
      const animation = {
        duration,
        animations
      };
      setRecordedAnimation(animation);
      setShowPreview(true);
      if (onAnimationRecorded) {
        onAnimationRecorded(animation);
      }
    }

    setIsRecording(false);
    recordingStartTime.current = null;
    animationFrames.current.clear();
  };

  const handleClearField = () => {
    if (isRecording) return;
    
    if (showClearConfirm) {
      onPositionChange([]);
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  // Hide clear confirmation after delay
  useEffect(() => {
    if (showClearConfirm) {
      const timer = setTimeout(() => setShowClearConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showClearConfirm]);

  return (
    <div className="space-y-4">
      {/* Control Buttons Row */}
      {isEditable && (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <button
            onClick={() => handleAddPosition('player')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            title="Add Player"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddPosition('ball')}
            className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
            title="Add Ball"
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddPosition('runner')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            title="Add Runner"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAddPosition('batter')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add Batter"
            disabled={positions.some(p => p.type === 'batter')}
          >
            <Circle className="w-5 h-5" />
          </button>
          <button
            onClick={handleClearField}
            className={`px-4 py-2 ${showClearConfirm ? 'bg-red-600' : 'bg-red-500'} text-white rounded-lg hover:bg-red-600`}
            title={showClearConfirm ? 'Click again to confirm' : 'Clear Field'}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Field View */}
      {showPreview && recordedAnimation ? (
        <AnimationPreview
          positions={positions}
          animation={recordedAnimation}
          onComplete={() => setShowPreview(false)}
        />
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            className="w-full h-full touch-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => {
              if ((e.target as SVGElement).tagName !== 'svg') {
                return;
              }
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
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
            {positions.map((pos, index) => (
              <g
                key={index}
                transform={`translate(${pos.x},${pos.y})`}
                onMouseDown={(e) => handleDragStart(index, e)}
                onTouchStart={(e) => handleTouchStart(index, e)}
                style={{ cursor: isEditable ? 'move' : 'not-allowed' }}
                className="touch-none"
              >
                {pos.type === 'player' && (
                  <circle
                    r="3"
                    fill={selectedPosition === index ? '#4CAF50' : '#2196F3'}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                )}
                {pos.type === 'ball' && (
                  <circle
                    r="1.5"
                    fill="white"
                    stroke="#333"
                    strokeWidth="0.5"
                  />
                )}
                {pos.type === 'runner' && (
                  <path
                    d="M-2,-2 L2,2 M-2,2 L2,-2"
                    stroke="#FF5722"
                    strokeWidth="1"
                  />
                )}
                {pos.type === 'batter' && (
                  <g>
                    <circle r="2" fill="#E91E63" stroke="white" strokeWidth="0.5" />
                    <line x1="-2" y1="0" x2="2" y2="0" stroke="white" strokeWidth="0.5" transform="rotate(45)" />
                  </g>
                )}
                {pos.label && (
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="3"
                    className="select-none"
                  >
                    {pos.label}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Trash Zone */}
          {isDragging && (
            <div 
              ref={trashZoneRef}
              className="absolute bottom-4 left-4 p-4 bg-red-100 rounded-lg border-2 border-dashed border-red-400 touch-none"
            >
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>
      )}

      {/* Recording Controls */}
      {isEditable && (
        <div className="flex justify-center gap-4 mt-4">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm sm:text-base whitespace-nowrap"
            >
              Record Movement
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base whitespace-nowrap"
            >
              Stop Recording
            </button>
          )}
          {recordedAnimation && (
            <button
              onClick={() => setShowPreview(true)}
              className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:opacity-90 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              Preview
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Field;

export { Field };