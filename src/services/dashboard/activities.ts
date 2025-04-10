import { collection, addDoc, Timestamp, getDocs, query, where, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DashboardActivity } from './types';
import { handleDashboardError } from './errors';

interface ActivityData extends DocumentData {
  type: 'award' | 'practice' | 'message' | 'progress' | 'homework_assigned' | 'homework_completed';
  title: string;
  description: string;
  teamId: string;
  teamName?: string;
  relatedUserId?: string;
  relatedUserName?: string;
}

function validateActivityData(data: ActivityData): void {
  if (!data.type) throw new Error('Activity type is required');
  if (!data.title) throw new Error('Activity title is required');
  if (!data.description) throw new Error('Activity description is required');
  if (!data.teamId) throw new Error('Team ID is required');
}

export async function createActivity(data: ActivityData): Promise<string> {
  try {
    validateActivityData(data);

    // Get team name if not provided
    if (!data.teamName && data.teamId) {
      const teamDoc = await getDocs(query(
        collection(db, 'teams'),
        where('__name__', '==', data.teamId)
      ));
      
      if (!teamDoc.empty) {
        data.teamName = teamDoc.docs[0].data().name;
      }
    }

    const now = Timestamp.now();
    const activitiesRef = collection(db, 'activities');
    const activityData = {
      ...data,
      timestamp: now,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(activitiesRef, activityData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw handleDashboardError(error);
  }
}

export async function fetchActivities(teamIds: string[]): Promise<DashboardActivity[]> {
  if (!teamIds?.length) {
    return [];
  }

  try {
    const activities: DashboardActivity[] = [];
    
    // Process teams in batches of 10 (Firestore limitation)
    for (let i = 0; i < teamIds.length; i += 10) {
      const teamBatch = teamIds.slice(i, i + 10);
      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('teamId', 'in', teamBatch),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data) {
          activities.push({
            id: doc.id,
            type: data.type,
            title: data.title || 'Untitled Activity',
            description: data.description || '',
            timestamp: data.timestamp?.toDate() || new Date(),
            teamId: data.teamId,
            teamName: data.teamName || '',
            relatedUserId: data.relatedUserId,
            relatedUserName: data.relatedUserName
          });
        }
      });
    }

    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw handleDashboardError(error);
  }
}