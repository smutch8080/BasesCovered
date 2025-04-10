import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lesson } from '../types/lessons';
import { ArrowLeft } from 'lucide-react';
import { LessonWizard } from '../components/lessons/LessonWizard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) return;

      try {
        setIsLoading(true);
        const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
        
        if (lessonDoc.exists()) {
          const data = lessonDoc.data();
          setLesson({
            ...data,
            id: lessonDoc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Lesson);
        } else {
          toast.error('Lesson not found');
        }
      } catch (error) {
        console.error('Error loading lesson:', error);
        toast.error('Unable to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const handleLessonComplete = async () => {
    if (!currentUser || !lesson) return;

    try {
      const earnedAt = new Date();
      // Add badge to user's profile
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        badges: arrayUnion({
          type: 'lesson',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          earnedAt: Timestamp.fromDate(earnedAt)
        })
      });

      toast.success('Congratulations! You\'ve earned a badge for completing this lesson. View it in your profile!');
    } catch (error) {
      console.error('Error awarding badge:', error);
      toast.error('Failed to award badge');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/coaches-university"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Lessons
        </Link>
      </div>

      <LessonWizard
        lesson={lesson}
        onComplete={handleLessonComplete}
      />
    </div>
  );
}

export default LessonDetailPage;