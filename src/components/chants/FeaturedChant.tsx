import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Star } from 'lucide-react';
import { Chant } from '../../types/chants';

interface Props {
  chant: Chant;
}

export const FeaturedChant: React.FC<Props> = ({ chant }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-brand-primary" />
          <div>
            <h3 className="text-2xl font-bold text-brand-dark">{chant.title}</h3>
            <div className="flex items-center gap-2 text-brand-muted mt-1">
              <Star className="w-4 h-4 fill-current text-brand-accent" />
              <span>{chant.avgRating.toFixed(1)} ({chant.totalRatings} ratings)</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <pre className="font-sans text-brand-dark whitespace-pre-wrap text-lg leading-relaxed">
            {chant.lyrics}
          </pre>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <span className="badge bg-brand-light text-brand-dark">
              {chant.category.replace(/_/g, ' ')}
            </span>
            <span className="badge bg-brand-light text-brand-dark">
              {chant.difficulty}
            </span>
          </div>
          <Link
            to={`/chants/${chant.id}`}
            className="btn-primary"
          >
            View Cheer
          </Link>
        </div>
      </div>
    </div>
  );
};