import React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Music, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { Chant } from '../../types/chants';

interface Props {
  chant: Chant;
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
}

export const SwipeableChantCard: React.FC<Props> = ({ chant, onSwipe, active }) => {
  const [{ x, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    scale: active ? 1 : 0.9,
    config: { tension: 300, friction: 20 }
  }));

  const bind = useDrag(({ down, movement: [mx], direction: [xDir], velocity: [vx], event }) => {
    // Don't initiate drag if clicking on a button
    if (event && (event.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    const trigger = Math.abs(mx) > 100 || vx > 0.5;
    
    if (!down && trigger) {
      const direction = xDir < 0 ? 'left' : 'right';
      api.start({
        x: direction === 'left' ? -500 : 500,
        rotate: direction === 'left' ? -50 : 50,
        onRest: () => onSwipe(direction)
      });
    } else {
      api.start({
        x: down ? mx : 0,
        rotate: down ? mx / 20 : 0,
        immediate: down
      });
    }
  }, {
    enabled: active,
    filterTaps: true,
    bounds: { left: -300, right: 300, top: 0, bottom: 0 },
    rubberband: true
  });

  const handleButtonClick = (direction: 'left' | 'right') => {
    if (!active) return;
    
    api.start({
      x: direction === 'left' ? -500 : 500,
      rotate: direction === 'left' ? -50 : 50,
      onRest: () => onSwipe(direction)
    });
  };

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        rotate,
        scale,
        touchAction: 'none',
        position: 'absolute',
        width: '100%',
        willChange: 'transform'
      }}
      className="bg-white rounded-xl shadow-xl overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{chant.title}</h3>
            <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full">
              {chant.category.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="font-medium">{chant.avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({chant.totalRatings})</span>
          </div>
        </div>

        <pre className="whitespace-pre-wrap font-sans text-gray-600 mb-6 text-lg">
          {chant.lyrics}
        </pre>

        <div className="flex justify-between items-center mb-12">
          <div className="space-x-2">
            <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
              {chant.difficulty}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between">
          <button
            type="button"
            onClick={() => handleButtonClick('left')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full 
              hover:bg-red-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Skip
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick('right')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full
              hover:bg-green-600 transition-colors cursor-pointer"
          >
            Save
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </animated.div>
  );
};