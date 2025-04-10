import { create } from 'zustand';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, orderBy, Timestamp, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { Drill, PracticePlan, DrillCategory, SavedPracticePlan, PracticeAward, PracticePlanTemplate } from './types';
import toast from 'react-hot-toast';

interface StoreState {
  selectedCategory: DrillCategory | null;
  drills: Drill[];
  currentPlan: PracticePlan | null;
  savedPlans: SavedPracticePlan[];
  favoriteDrills: Set<string>;
  setSelectedCategory: (category: DrillCategory | null) => void;
  addDrillToPlan: (drill: Drill) => void;
  removeDrillFromPlan: (drillId: string) => void;
  updateDrillDuration: (drillId: string, duration: number) => void;
  updatePlanDetails: (details: Partial<PracticePlan>) => void;
  voteDrill: (drillId: string) => Promise<void>;
  addComment: (drillId: string, comment: string) => Promise<void>;
  loadDrills: () => Promise<void>;
  addDrill: (drill: Omit<Drill, 'id' | 'votes' | 'comments'>) => Promise<void>;
  updateDrill: (drillId: string, drill: Partial<Omit<Drill, 'id' | 'votes' | 'comments'>>) => Promise<void>;
  loadSavedPlans: (userId: string) => Promise<void>;
  savePlan: (
    name: string, 
    userId: string, 
    featured?: boolean, 
    playerId?: string, 
    playerName?: string, 
    description?: string,
    notes?: string,
    awards?: PracticeAward[],
    teamId?: string
  ) => Promise<void>;
  loadPlan: (plan: SavedPracticePlan) => Promise<void>;
  initializePlan: () => void;
  loadTemplate: (templateId: string) => Promise<void>;
  useTemplate: (templateId: string) => Promise<void>;
  toggleFavoriteDrill: (drillId: string) => Promise<void>;
  loadFavoriteDrills: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  selectedCategory: null,
  drills: [],
  currentPlan: null,
  savedPlans: [],
  favoriteDrills: new Set(),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  addDrillToPlan: (drill) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({
      currentPlan: {
        ...currentPlan,
        drills: [...currentPlan.drills, drill]
      }
    });
  },

  removeDrillFromPlan: (drillId) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({
      currentPlan: {
        ...currentPlan,
        drills: currentPlan.drills.filter(d => d.id !== drillId)
      }
    });
  },

  updateDrillDuration: (drillId, duration) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({
      currentPlan: {
        ...currentPlan,
        drills: currentPlan.drills.map(d => 
          d.id === drillId ? { ...d, duration } : d
        )
      }
    });
  },

  updatePlanDetails: (details) => {
    const { currentPlan } = get();
    if (!currentPlan) return;

    set({
      currentPlan: {
        ...currentPlan,
        ...details
      }
    });
  },

  voteDrill: async (drillId) => {
    try {
      const drillRef = doc(db, 'drills', drillId);
      await updateDoc(drillRef, {
        votes: arrayUnion(1)
      });

      const { drills } = get();
      set({
        drills: drills.map(d => 
          d.id === drillId ? { ...d, votes: d.votes + 1 } : d
        )
      });
    } catch (error) {
      console.error('Error voting for drill:', error);
      toast.error('Failed to vote for drill');
    }
  },

  addComment: async (drillId, comment) => {
    try {
      const drillRef = doc(db, 'drills', drillId);
      const newComment = {
        id: Math.random().toString(),
        content: comment,
        author: 'Current User', // Replace with actual user name
        timestamp: new Date()
      };

      await updateDoc(drillRef, {
        comments: arrayUnion(newComment)
      });

      const { drills } = get();
      set({
        drills: drills.map(d => 
          d.id === drillId 
            ? { ...d, comments: [...d.comments, newComment] }
            : d
        )
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  },

  loadDrills: async () => {
    try {
      console.log('Loading drills from Firestore');
      const drillsRef = collection(db, 'drills');
      const q = query(drillsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedDrills: Drill[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedDrills.push({
          ...data,
          id: doc.id,
          comments: data.comments || [],
          votes: data.votes || 0,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Drill);
      });

      console.log(`Loaded ${loadedDrills.length} drills`);
      set({ drills: loadedDrills });
    } catch (error) {
      console.error('Error loading drills:', error);
      toast.error('Failed to load drills');
    }
  },

  addDrill: async (drill) => {
    try {
      const drillsRef = collection(db, 'drills');
      const docRef = await addDoc(drillsRef, {
        ...drill,
        votes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newDrill: Drill = {
        ...drill,
        id: docRef.id,
        votes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { drills } = get();
      set({ drills: [newDrill, ...drills] });
      toast.success('Drill added successfully');
    } catch (error) {
      console.error('Error adding drill:', error);
      toast.error('Failed to add drill');
    }
  },

  updateDrill: async (drillId, updates) => {
    try {
      const drillRef = doc(db, 'drills', drillId);
      await updateDoc(drillRef, {
        ...updates,
        updatedAt: new Date()
      });

      const { drills } = get();
      set({
        drills: drills.map(d => 
          d.id === drillId ? { ...d, ...updates, updatedAt: new Date() } : d
        )
      });
      toast.success('Drill updated successfully');
    } catch (error) {
      console.error('Error updating drill:', error);
      toast.error('Failed to update drill');
    }
  },

  loadSavedPlans: async (userId) => {
    try {
      const plansRef = collection(db, 'practice_plans');
      const q = query(
        plansRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedPlans: SavedPracticePlan[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedPlans.push({
          ...data,
          id: doc.id,
          date: data.date.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as SavedPracticePlan);
      });

      set({ savedPlans: loadedPlans });
    } catch (error) {
      console.error('Error loading saved plans:', error);
      toast.error('Failed to load saved plans');
    }
  },

  savePlan: async (name, userId, featured = false, playerId, playerName, description, notes, awards, teamId) => {
    try {
      const { currentPlan } = get();
      
      console.log('Starting plan save with data:', {
        name,
        userId,
        featured,
        isPlayerPlan: !!playerId,
        playerName,
        hasDescription: !!description,
        hasNotes: !!notes,
        awardsCount: awards?.length,
        teamId
      });

      if (!currentPlan) {
        console.error('No current plan to save');
        throw new Error('No current plan to save');
      }

      // Ensure all dates are valid
      const now = new Date();
      const planDate = currentPlan.date instanceof Date && !isNaN(currentPlan.date.getTime()) 
        ? currentPlan.date 
        : now;

      // Clean up awards data if present
      const cleanedAwards = awards?.map(award => ({
        ...award,
        date: award.date instanceof Date ? award.date : new Date(award.date),
        createdAt: award.createdAt instanceof Date ? award.createdAt : new Date(award.createdAt),
        updatedAt: award.updatedAt instanceof Date ? award.updatedAt : new Date(award.updatedAt)
      })) || [];

      // Create base plan data
      const planData = {
        name: name.trim(),
        userId,
        teamId,
        teamName: currentPlan.teamName,
        date: planDate,
        duration: currentPlan.duration || 90,
        location: currentPlan.location?.trim() || '',
        drills: currentPlan.drills,
        warmup: currentPlan.warmup || { enabled: false, duration: 15 },
        notes: notes?.trim() || null,
        awards: cleanedAwards,
        featured,
        description: description?.trim() || null,
        createdAt: now,
        updatedAt: now
      };

      // Only add player fields if this is a player-specific plan
      if (playerId && playerName) {
        planData.playerId = playerId;
        planData.playerName = playerName;
      }

      console.log('Prepared plan data:', planData);

      // Convert dates for Firestore
      const firestoreData = {
        ...planData,
        date: Timestamp.fromDate(planDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        awards: cleanedAwards.map(award => ({
          ...award,
          date: Timestamp.fromDate(award.date),
          createdAt: Timestamp.fromDate(award.createdAt),
          updatedAt: Timestamp.fromDate(award.updatedAt)
        }))
      };

      console.log('Prepared Firestore data:', firestoreData);

      const plansRef = collection(db, 'practice_plans');
      const docRef = await addDoc(plansRef, firestoreData);
      
      console.log('Plan saved successfully with ID:', docRef.id);
      toast.success('Practice plan saved successfully');
    } catch (error) {
      console.error('Error saving plan:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack
      });
      toast.error('Failed to save practice plan');
      throw error;
    }
  },

  loadPlan: async (plan) => {
    console.log('Loading plan:', {
      id: plan.id,
      name: plan.name,
      drillCount: plan.drills?.length,
      date: plan.date,
      teamId: plan.teamId
    });

    try {
      // First load all drills if not already loaded
      const { drills } = get();
      if (drills.length === 0) {
        console.log('Loading drills before loading plan');
        await get().loadDrills();
      }

      // Ensure all plan data is properly transformed
      const transformedPlan = {
        ...plan,
        // Ensure date is a Date object
        date: plan.date instanceof Date ? plan.date : new Date(plan.date),
        // Ensure drills array exists and is properly structured
        drills: (plan.drills || []).map(drill => ({
          ...drill,
          // Ensure drill dates are Date objects if they exist
          createdAt: drill.createdAt ? new Date(drill.createdAt) : undefined,
          updatedAt: drill.updatedAt ? new Date(drill.updatedAt) : undefined,
          // Ensure arrays exist
          equipment: drill.equipment || [],
          comments: drill.comments || [],
          resources: drill.resources || [],
          // Ensure numeric values
          votes: drill.votes || 0,
          duration: drill.duration || 15
        })),
        // Ensure warmup settings exist
        warmup: plan.warmup || {
          enabled: false,
          duration: 15
        },
        // Ensure arrays exist
        awards: plan.awards || [],
        // Ensure strings are properly initialized
        notes: plan.notes || '',
        location: plan.location || '',
        teamName: plan.teamName || ''
      };

      console.log('Transformed plan:', {
        drillCount: transformedPlan.drills.length,
        hasWarmup: !!transformedPlan.warmup,
        hasAwards: transformedPlan.awards.length > 0
      });

      set({ currentPlan: transformedPlan });
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load practice plan');
    }
  },

  initializePlan: () => {
    set({
      currentPlan: {
        id: Math.random().toString(),
        teamName: '',
        teamId: null,
        date: new Date(),
        duration: 90,
        location: '',
        drills: [],
        warmup: {
          enabled: false,
          duration: 15
        },
        notes: '',
        awards: []
      }
    });
  },

  loadTemplate: async (templateId) => {
    try {
      const templateDoc = await getDoc(doc(db, 'practice_plans', templateId));
      if (!templateDoc.exists()) {
        throw new Error('Template not found');
      }

      const data = templateDoc.data();
      const template = {
        ...data,
        id: templateDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as PracticePlanTemplate;

      // Initialize new plan from template
      set({
        currentPlan: {
          id: Math.random().toString(),
          teamId: null,
          teamName: '',
          drills: template.drills,
          duration: template.duration,
          warmup: template.warmup,
          notes: template.notes
        }
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  },

  useTemplate: async (templateId) => {
    try {
      await get().loadTemplate(templateId);
      toast.success('Template loaded successfully');
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  },

  toggleFavoriteDrill: async (drillId) => {
    try {
      const { favoriteDrills } = get();
      const isFavorited = favoriteDrills.has(drillId);
      const userId = auth.currentUser?.uid;

      if (!userId) {
        toast.error('Please sign in to favorite drills');
        return;
      }

      if (isFavorited) {
        // Remove from favorites
        const q = query(
          collection(db, 'user_favorites'),
          where('userId', '==', userId),
          where('drillId', '==', drillId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          await deleteDoc(snapshot.docs[0].ref);
        }
        
        const newFavorites = new Set(favoriteDrills);
        newFavorites.delete(drillId);
        set({ favoriteDrills: newFavorites });
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        await addDoc(collection(db, 'user_favorites'), {
          userId,
          drillId,
          createdAt: new Date()
        });
        
        const newFavorites = new Set(favoriteDrills);
        newFavorites.add(drillId);
        set({ favoriteDrills: newFavorites });
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  },

  loadFavoriteDrills: async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(
        collection(db, 'user_favorites'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const favorites = new Set<string>();
      
      snapshot.forEach(doc => {
        favorites.add(doc.data().drillId);
      });
      
      set({ favoriteDrills: favorites });
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    }
  }
}));