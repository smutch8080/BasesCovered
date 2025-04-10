import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Clock, Plus, Edit, Star } from 'lucide-react';
import { Drill } from '../types';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  drill: Drill;
  inPlan?: boolean;
  className?: string;
  onToggle?: () => void;
}

export const DrillCard: React.FC<Props> = ({ drill, inPlan, className = '', onToggle }) => {
  const { currentUser } = useAuth();
  const { voteDrill, addDrillToPlan, removeDrillFromPlan, favoriteDrills, toggleFavoriteDrill } = useStore();
  const navigate = useNavigate();
  const isFavorited = favoriteDrills.has(drill.id);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      if (inPlan) {
        removeDrillFromPlan(drill.id);
      } else {
        addDrillToPlan(drill);
      }
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card click/navigation
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await toggleFavoriteDrill(drill.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link to={`/drills/${drill.id}`} className="hover:text-brand-primary">
              <h3 className="text-lg font-semibold text-gray-800">{drill.name}</h3>
            </Link>
            <p className="text-gray-600">{drill.shortDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {drill.duration}min
            </span>
            {currentUser?.role === 'admin' && (
              <Link
                to={`/drills/${drill.id}/edit`}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                isFavorited ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {drill.equipment.map((item) => (
            <span key={item} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
              {item}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => voteDrill(drill.id)}
              className="flex items-center gap-1 text-gray-600 hover:text-brand-primary"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{drill.votes}</span>
            </button>
            
            <div className="flex items-center gap-1 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{drill.comments.length}</span>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                inPlan 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-brand-primary hover:bg-opacity-90 text-white'
              }`}
            >
              <Plus className={`w-4 h-4 ${inPlan ? 'rotate-45' : ''}`} />
              {inPlan ? 'Remove' : 'Add to Plan'}
            </button>
          ) : (
            <Link
              to="/register"
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Sign Up to Add
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Also export as default for backward compatibility
export default DrillCard;