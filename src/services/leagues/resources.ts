import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LeagueResource } from '../../types/resources';
import { handleLeagueError } from './errors';

export async function fetchLeagueResources(leagueId: string): Promise<LeagueResource[]> {
  try {
    // First verify league exists and user has access
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueDoc = await getDoc(leagueRef);
    
    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    console.log('Fetching resources for league:', leagueId);
    const resourcesRef = collection(db, 'league_resources');
    const q = query(
      resourcesRef,
      where('leagueId', '==', leagueId),
      where('access.type', 'in', ['all', 'teams']),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const resources: LeagueResource[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      resources.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as LeagueResource);
    });

    console.log(`Found ${resources.length} resources for league ${leagueId}`);
    return resources;
  } catch (error) {
    console.error('Error fetching league resources:', error);
    throw handleLeagueError(error);
  }
}

export async function createLeagueResource(
  leagueId: string,
  data: Omit<LeagueResource, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LeagueResource> {
  try {
    // First verify league exists and user has access
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueDoc = await getDoc(leagueRef);
    
    if (!leagueDoc.exists()) {
      throw new Error('League not found');
    }

    const resourceData = {
      ...data,
      leagueId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'league_resources'), resourceData);
    
    return {
      ...resourceData,
      id: docRef.id,
      createdAt: resourceData.createdAt.toDate(),
      updatedAt: resourceData.updatedAt.toDate()
    } as LeagueResource;
  } catch (error) {
    console.error('Error creating league resource:', error);
    throw handleLeagueError(error);
  }
}

export async function updateLeagueResource(
  resourceId: string,
  data: Partial<LeagueResource>
): Promise<void> {
  try {
    const resourceRef = doc(db, 'league_resources', resourceId);
    await updateDoc(resourceRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating league resource:', error);
    throw handleLeagueError(error);
  }
}

export async function deleteLeagueResource(resourceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'league_resources', resourceId));
  } catch (error) {
    console.error('Error deleting league resource:', error);
    throw handleLeagueError(error);
  }
}