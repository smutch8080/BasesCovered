import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Plus, Search, Filter } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Chant, ChantCategory, ChantDifficulty } from '../types/chants';
import { ChantStack } from '../components/chants/ChantStack';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function ChantsPage() {
  const [chants, setChants] = useState<Chant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChantCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChantDifficulty | 'all'>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    loadChants();
  }, []);

  const loadChants = async () => {
    try {
      setIsLoading(true);
      const chantsRef = collection(db, 'chants');
      const q = query(
        chantsRef,
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedChants: Chant[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedChants.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          featuredUntil: data.featuredUntil?.toDate()
        } as Chant);
      });

      setChants(loadedChants);
    } catch (error) {
      console.error('Error loading chants:', error);
      toast.error('Unable to load chants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChant = async (chant: Chant) => {
    if (!currentUser) {
      toast.error('Please sign in to save chants');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        savedChants: arrayUnion(chant.id)
      });
      toast.success('Chant saved to your collection');
    } catch (error) {
      console.error('Error saving chant:', error);
      toast.error('Failed to save chant');
    }
  };

  const handleSkipChant = (chant: Chant) => {
    // Optional: Track skipped chants for analytics
    console.log('Skipped chant:', chant.id);
  };

  const filteredChants = chants.filter(chant => {
    const matchesSearch = chant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chant.lyrics.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || chant.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || chant.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-brand-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Team Cheers</h1>
          </div>

          {currentUser && (
            <Link
              to="/chants/new"
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Submit Cheer
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chants..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ChantCategory | 'all')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Categories</option>
                {Object.entries(ChantCategory).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as ChantDifficulty | 'all')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Difficulties</option>
                {Object.values(ChantDifficulty).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading cheers...</p>
          </div>
        ) : filteredChants.length > 0 ? (
          <ChantStack
            chants={filteredChants}
            onSave={handleSaveChant}
            onSkip={handleSkipChant}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Cheers Found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? 'Try adjusting your search filters'
                : 'No chants available yet'}
            </p>
            {currentUser && (
              <Link
                to="/chants/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Submit First Cheer
              </Link>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}