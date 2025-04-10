import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Lesson } from '../../types/lessons';
import { PracticePlanSelector } from '../practice/PracticePlanSelector';
import { CollectionSelector } from '../collections/CollectionSelector';
import { RichTextEditor } from '../editor/RichTextEditor';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: (lesson: Lesson) => void;
}

export const NewLessonDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onLessonCreated
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [basics, setBasics] = useState('');
  const [mechanics, setMechanics] = useState('');
  const [insights, setInsights] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [faqs, setFaqs] = useState('');
  const [practicePlans, setPracticePlans] = useState<{ id: string; name: string }[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [resources, setResources] = useState<{ type: 'video' | 'document'; title: string; url: string }[]>([]);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const lessonData = {
        title: title.trim(),
        summary: summary.trim(),
        introduction: introduction.trim(),
        basics: basics.trim(),
        mechanics: mechanics.trim(),
        insights: insights.trim(),
        conclusion: conclusion.trim(),
        faqs: faqs.trim(),
        practicePlans,
        collections,
        resources,
        createdBy: currentUser.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'lessons'), lessonData);
      
      const newLesson: Lesson = {
        ...lessonData,
        id: docRef.id,
        createdAt: lessonData.createdAt.toDate(),
        updatedAt: lessonData.updatedAt.toDate()
      };

      onLessonCreated(newLesson);
      onClose();
      
      // Reset form
      setTitle('');
      setSummary('');
      setIntroduction('');
      setBasics('');
      setMechanics('');
      setInsights('');
      setConclusion('');
      setFaqs('');
      setPracticePlans([]);
      setCollections([]);
      setResources([]);
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            Create New Lesson
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <RichTextEditor
              label="Summary"
              value={summary}
              onChange={setSummary}
              required
              height={200}
            />

            <RichTextEditor
              label="Introduction"
              value={introduction}
              onChange={setIntroduction}
              required
            />

            <RichTextEditor
              label="Understanding the Basics"
              value={basics}
              onChange={setBasics}
              required
            />

            <RichTextEditor
              label="Step-by-Step Mechanics"
              value={mechanics}
              onChange={setMechanics}
              required
            />

            <RichTextEditor
              label="Strategic Insights"
              value={insights}
              onChange={setInsights}
              required
            />

            <RichTextEditor
              label="Conclusion"
              value={conclusion}
              onChange={setConclusion}
              required
              height={200}
            />

            <RichTextEditor
              label="FAQs"
              value={faqs}
              onChange={setFaqs}
              required
            />

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
              >
                Create Lesson
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>

      <PracticePlanSelector
        isOpen={showPlanSelector}
        onClose={() => setShowPlanSelector(false)}
        selectedPlanIds={practicePlans.map(p => p.id)}
        onPlansSelected={setPracticePlans}
      />

      <CollectionSelector
        isOpen={showCollectionSelector}
        onClose={() => setShowCollectionSelector(false)}
        selectedCollectionIds={collections.map(c => c.id)}
        onCollectionsSelected={setCollections}
      />
    </Dialog>
  );
};