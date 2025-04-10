import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChantCategory, ChantDifficulty } from '../types/chants';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function NewChantPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    rhythm: '',
    difficulty: ChantDifficulty.Beginner,
    minPeople: 1,
    maxPeople: '',
    category: '' as ChantCategory,
    gameSituation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const chantData = {
        ...formData,
        maxPeople: formData.maxPeople ? parseInt(formData.maxPeople as string) : null,
        createdBy: currentUser.id,
        isApproved: false,
        avgRating: 0,
        totalRatings: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'chants'), chantData);
      toast.success('Chant submitted successfully! It will be reviewed before being published.');
      navigate('/chants');
    } catch (error) {
      console.error('Error submitting chant:', error);
      toast.error('Failed to submit chant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/chants"
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Chants
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Submit New Chant</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter chant title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lyrics
              </label>
              <textarea
                value={formData.lyrics}
                onChange={(e) => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                required
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter chant lyrics"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ChantCategory }))}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Select category...</option>
                  {Object.entries(ChantCategory).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as ChantDifficulty }))}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  {Object.values(ChantDifficulty).map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Situation (Optional)
              </label>
              <textarea
                value={formData.gameSituation}
                onChange={(e) => setFormData(prev => ({ ...prev, gameSituation: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="When is this chant best used? (e.g., 'When team needs a rally in late innings')"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                to="/chants"
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Chant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}