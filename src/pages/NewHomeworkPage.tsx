import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { HomeworkForm, HomeworkFormData } from '../components/homework/HomeworkForm';
import toast from 'react-hot-toast';

const NewHomeworkPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: HomeworkFormData) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const homeworkData = {
        ...data,
        createdBy: currentUser.id,
        submissions: [],
        dueDate: Timestamp.fromDate(data.dueDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        teamId: data.teamId
      };

      // Remove playerId if it's undefined
      if (!homeworkData.playerId) {
        delete homeworkData.playerId;
      }

      await addDoc(collection(db, 'homework'), homeworkData);
      toast.success('Homework assigned successfully');
      navigate('/homework');
    } catch (error) {
      console.error('Error creating homework:', error);
      toast.error('Failed to create homework assignment');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Assign New Homework
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <HomeworkForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default NewHomeworkPage;