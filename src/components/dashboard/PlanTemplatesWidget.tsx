import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PracticePlanTemplate } from '../../types';
import { ClipboardList, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const PlanTemplatesWidget: React.FC = () => {
  const [templates, setTemplates] = useState<PracticePlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const templatesRef = collection(db, 'practice_plans');
        const q = query(
          templatesRef,
          where('isTemplate', '==', true),
          where('featured', '==', true),
          orderBy('updatedAt', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedTemplates: PracticePlanTemplate[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTemplates.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as PracticePlanTemplate);
        });

        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast.error('Unable to load practice plan templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  if (isLoading || templates.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-800">Featured Practice Plans</h2>
        </div>
        <Link
          to="/practice-plan/templates"
          className="flex items-center gap-1 text-brand-primary hover:opacity-90"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Link
            key={template.id}
            to={`/practice-plan/new?template=${template.id}`}
            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-medium text-gray-800 mb-1">{template.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{template.skillLevel}</span>
              <span>•</span>
              <span>{template.drills.length} drills</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};