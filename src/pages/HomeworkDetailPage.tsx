import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Homework } from '../types/homework';
import { HomeworkProgress } from '../components/homework/HomeworkProgress';
import { HomeworkSubmissionForm } from '../components/homework/HomeworkSubmissionForm';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function HomeworkDetailPage() {
  const { homeworkId } = useParams();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadHomework = async () => {
      if (!homeworkId) return;

      try {
        setIsLoading(true);
        const homeworkDoc = await getDoc(doc(db, 'homework', homeworkId));
        
        if (homeworkDoc.exists()) {
          const data = homeworkDoc.data();
          setHomework({
            ...data,
            id: homeworkDoc.id,
            dueDate: data.dueDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Homework);
        } else {
          toast.error('Homework not found');
        }
      } catch (error) {
        console.error('Error loading homework:', error);
        toast.error('Unable to load homework details');
      } finally {
        setIsLoading(false);
      }
    };

    loadHomework();
  }, [homeworkId]);

  const handleSubmit = async (data: { comment: string; attachments: any[] }) => {
    if (!currentUser || !homework) return;

    try {
      const submission = {
        id: Math.random().toString(),
        playerId: currentUser.id,
        playerName: currentUser.displayName,
        status: 'completed',
        comment: data.comment,
        attachments: data.attachments,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const homeworkRef = doc(db, 'homework', homework.id);
      await updateDoc(homeworkRef, {
        submissions: arrayUnion(submission),
        updatedAt: Timestamp.now()
      });

      setHomework(prev => prev ? {
        ...prev,
        submissions: [...prev.submissions, {
          ...submission,
          submittedAt: submission.submittedAt.toDate(),
          updatedAt: submission.updatedAt.toDate()
        }]
      } : null);

      toast.success('Homework submitted successfully');
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('Failed to submit homework');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading homework details...</p>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Homework not found</p>
      </div>
    );
  }

  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';
  const isPlayer = currentUser?.role === 'player';
  const playerSubmission = isPlayer 
    ? homework.submissions.find(s => s.playerId === currentUser.id)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/homework"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Homework
        </Link>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {isCoach && (
          <HomeworkProgress
            submissions={homework.submissions}
            dueDate={homework.dueDate}
          />
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {homework.title}
          </h1>

          {homework.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{homework.description}</p>
            </div>
          )}

          {isPlayer && !playerSubmission && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit Homework</h2>
              <HomeworkSubmissionForm onSubmit={handleSubmit} />
            </div>
          )}

          {playerSubmission && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Submission</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Submitted on {playerSubmission.submittedAt.toLocaleDateString()}</span>
                </div>
                {playerSubmission.comment && (
                  <p className="text-gray-600">{playerSubmission.comment}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeworkDetailPage;