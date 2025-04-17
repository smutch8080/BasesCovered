import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageCircle, Plus, UserPlus } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Drill } from '../types';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function DrillDetailPage() {
  const { drillId } = useParams();
  const [drill, setDrill] = useState<Drill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { voteDrill, addDrillToPlan, addComment } = useStore();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const loadDrill = async () => {
      if (!drillId) return;

      try {
        setIsLoading(true);
        const drillDoc = await getDoc(doc(db, 'drills', drillId));
        
        if (drillDoc.exists()) {
          const data = drillDoc.data();
          setDrill({
            ...data,
            id: drillDoc.id,
            comments: data.comments || [],
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as Drill);
        } else {
          toast.error('Drill not found');
        }
      } catch (error) {
        console.error('Error loading drill:', error);
        toast.error('Unable to load drill details');
      } finally {
        setIsLoading(false);
      }
    };

    loadDrill();
  }, [drillId]);

  const handleVote = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (drill) {
      voteDrill(drill.id);
    }
  };

  const handleAddToPlan = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (drill) {
      addDrillToPlan(drill);
      toast.success('Drill added to practice plan');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (drill && newComment.trim()) {
      await addComment(drill.id, newComment.trim());
      setNewComment('');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!drill) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Drill not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/drills"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Drills
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {drill.imageUrl && (
            <div className="relative h-96">
              <img 
                src={drill.imageUrl} 
                alt={drill.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 bg-brand-primary text-white text-sm rounded-full mb-2">
                  {drill.category}
                </span>
                <h1 className="text-3xl font-bold text-white">{drill.name}</h1>
              </div>
            </div>
          )}

          <div className="p-6">
            {!drill.imageUrl && (
              <>
                <span className="inline-block px-3 py-1 bg-brand-primary text-white text-sm rounded-full mb-2">
                  {drill.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{drill.name}</h1>
              </>
            )}

            <div className="prose max-w-none mb-6">
              <p className="text-gray-600">{drill.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">What to Look For</h2>
                <p className="text-gray-600">{drill.whatToLookFor}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Equipment Needed</h2>
                <div className="flex flex-wrap gap-2">
                  {drill.equipment.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {drill.resources.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Resources</h2>
                  <div className="space-y-2">
                    {drill.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-brand-primary hover:opacity-90"
                      >
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="flex gap-6">
                <button
                  onClick={handleVote}
                  className="flex items-center gap-2 text-gray-600 hover:text-brand-primary"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>{drill.votes}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>{drill.comments.length}</span>
                </div>
              </div>

              {currentUser ? (
                <button
                  onClick={handleAddToPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                    hover:opacity-90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to Plan
                </button>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Sign in to save this drill to your collection</p>
                  <Link
                    to="/auth?mode=register"
                    className="btn-primary inline-flex items-center"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Comments</h2>
          
          {currentUser && (
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary mb-2"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </form>
          )}

          <div className="space-y-4">
            {drill.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{comment.author}</span>
                  <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
            {drill.comments.length === 0 && (
              <p className="text-center text-gray-500 py-4">No comments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrillDetailPage;