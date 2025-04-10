import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lesson, LessonCategory } from '../types/lessons';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Plus, Search } from 'lucide-react';
import { NewLessonDialog } from '../components/lessons/NewLessonDialog';
import { LessonCard } from '../components/lessons/LessonCard';
import { CategoryFilter } from '../components/lessons/CategoryFilter';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

function CoachesUniversityPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewLessonDialog, setShowNewLessonDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LessonCategory | 'all'>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setIsLoading(true);
        const lessonsRef = collection(db, 'lessons');
        const q = query(lessonsRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const loadedLessons: Lesson[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedLessons.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Lesson);
        });

        setLessons(loadedLessons);
      } catch (error) {
        console.error('Error loading lessons:', error);
        toast.error('Unable to load lessons');
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, []);

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-brand-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Coaches University</h1>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowNewLessonDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Lesson
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lessons..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading lessons...</p>
          </div>
        ) : filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                userBadges={currentUser?.badges}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Lessons Found</h2>
            {isAdmin ? (
              <>
                <p className="text-gray-600 mb-6">
                  Start by adding your first lesson to help coaches improve their skills.
                </p>
                <button
                  onClick={() => setShowNewLessonDialog(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                    hover:opacity-90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Lesson
                </button>
              </>
            ) : (
              <p className="text-gray-600">
                No lessons match your search criteria.
              </p>
            )}
          </div>
        )}

        {isAdmin && (
          <NewLessonDialog
            isOpen={showNewLessonDialog}
            onClose={() => setShowNewLessonDialog(false)}
            onLessonCreated={(newLesson) => {
              setLessons(prev => [newLesson, ...prev]);
              toast.success('Lesson created successfully');
            }}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default CoachesUniversityPage;