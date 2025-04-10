import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PracticeAward } from '../../types';
import { transformAward } from './transformers';
import { handleAwardsError } from './errors';

export async function fetchPlayerAwards(playerId: string): Promise<PracticeAward[]> {
  try {
    // First verify access
    const awardsRef = collection(db, 'team_awards');
    const q = query(
      awardsRef,
      where('playerId', '==', playerId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const awards: PracticeAward[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        awards.push(transformAward(doc.id, data));
      }
    });

    return awards;
  } catch (error: any) {
    // Log the error for debugging but don't expose internal details to user
    console.error('Error fetching player awards:', error);
    
    // Return empty array instead of throwing error for permission issues
    // This provides a more graceful degradation
    if (error.code === 'permission-denied') {
      console.log('Permission denied accessing awards, returning empty array');
      return [];
    }
    
    return handleAwardsError(error);
  }
}