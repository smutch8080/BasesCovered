import React, { useState, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Music } from 'lucide-react';
import { Chant } from '../../types/chants';
import { SwipeableChantCard } from './SwipeableChantCard';

interface Props {
  chants: Chant[];
  onSave: (chant: Chant) => void;
  onSkip: (chant: Chant) => void;
}

export const ChantStack: React.FC<Props> = ({ chants, onSave, onSkip }) => {
  const [stack, setStack] = useState<Chant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasShownTutorial, setHasShownTutorial] = useState(false);

  useEffect(() => {
    setStack(chants);
    // Check if tutorial has been shown before
    const tutorialShown = localStorage.getItem('chantTutorialShown');
    setHasShownTutorial(!!tutorialShown);
  }, [chants]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= stack.length) return;
    
    const chant = stack[currentIndex];
    if (direction === 'right') {
      onSave(chant);
    } else {
      onSkip(chant);
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  const handleCloseTutorial = () => {
    setHasShownTutorial(true);
    localStorage.setItem('chantTutorialShown', 'true');
  };

  if (stack.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Music className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No More Cheers</h3>
        <p className="text-gray-600">Check back later for new cheers!</p>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto">
      {/* Stack container with absolute positioning */}
      <div className="absolute inset-0">
        {stack.slice(currentIndex, currentIndex + 3).map((chant, index) => (
          <div 
            key={chant.id} 
            className="absolute inset-0"
            style={{
              zIndex: stack.length - index,
              transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
              opacity: 1 - index * 0.2
            }}
          >
            <SwipeableChantCard
              chant={chant}
              onSwipe={handleSwipe}
              active={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Tutorial Overlay */}
      {!hasShownTutorial && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">How to Use</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                <span>Swipe right to save a cheer</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">←</span>
                <span>Swipe left to skip</span>
              </li>
            </ul>
            <button
              onClick={handleCloseTutorial}
              className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};