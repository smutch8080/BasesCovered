import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Collection } from '../types/collections';
import { useAuth } from '../contexts/AuthContext';
import { PracticePlanSelector } from '../components/collections/PracticePlanSelector';
import { EditCollectionDialog } from '../components/collections/EditCollectionDialog';
import toast from 'react-hot-toast';

function CollectionDetailPage() {
  const { collectionId } = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadCollection = async () => {
      if (!collectionId) return;

      try {
        setIsLoading(true);
        const docRef = doc(db, 'collections', collectionId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCollection({
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Collection);
        } else {
          toast.error('Collection not found');
        }
      } catch (error) {
        console.error('Error loading collection:', error);
        toast.error('Unable to load collection');
      } finally {
        setIsLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  const handlePlansSelected = async (plans: { id: string; name: string }[]) => {
    if (!collection || !currentUser) return;

    try {
      const docRef = doc(db, 'collections', collection.id);
      await updateDoc(docRef, {
        practicePlans: plans,
        updatedAt: new Date()
      });

      setCollection(prev => prev ? { ...prev, practicePlans: plans } : null);
      toast.success('Practice plans updated successfully');
    } catch (error) {
      console.error('Error updating practice plans:', error);
      toast.error('Failed to update practice plans');
    }
  };

  const handleRemovePlan = async (planId: string) => {
    if (!collection || !currentUser) return;

    try {
      const updatedPlans = collection.practicePlans.filter(p => p.id !== planId);
      const docRef = doc(db, 'collections', collection.id);
      await updateDoc(docRef, {
        practicePlans: updatedPlans,
        updatedAt: new Date()
      });

      setCollection(prev => prev ? { ...prev, practicePlans: updatedPlans } : null);
      toast.success('Practice plan removed successfully');
    } catch (error) {
      console.error('Error removing practice plan:', error);
      toast.error('Failed to remove practice plan');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading collection...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Collection not found</p>
      </div>
    );
  }

  const canEdit = currentUser && (
    currentUser.id === collection.userId || 
    currentUser.role === 'admin'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/collections"
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Collections
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{collection.title}</h1>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Collection
            </button>
            <button
              onClick={() => setShowPlanSelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Practice Plans
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-600 mb-6">{collection.description}</p>

        {collection.featured && (
          <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full mb-6">
            Featured Collection
          </span>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Practice Plans</h2>
        
        {collection.practicePlans.length > 0 ? (
          <div className="space-y-4">
            {collection.practicePlans.map((plan) => (
              <div
                key={plan.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <Link
                  to={`/practice-plan/${plan.id}`}
                  className="text-brand-primary hover:opacity-90"
                >
                  {plan.name}
                </Link>
                {canEdit && (
                  <button
                    onClick={() => handleRemovePlan(plan.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No practice plans in this collection yet
          </p>
        )}
      </div>

      {canEdit && (
        <>
          <PracticePlanSelector
            isOpen={showPlanSelector}
            onClose={() => setShowPlanSelector(false)}
            onPlansSelected={handlePlansSelected}
            selectedPlanIds={collection.practicePlans.map(p => p.id)}
          />
          <EditCollectionDialog
            isOpen={showEditDialog}
            onClose={() => setShowEditDialog(false)}
            collection={collection}
            onCollectionUpdated={setCollection}
          />
        </>
      )}
    </div>
  );
}

export default CollectionDetailPage;