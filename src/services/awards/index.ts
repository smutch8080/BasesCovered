import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PracticeAward } from '../../types';
import { User } from '../../types/auth';
import { transformAward } from './transformers';
import { handleAwardsError } from './errors';

export async function fetchUserAwards(currentUser: User): Promise<PracticeAward[]> {
  if (!currentUser) {
    throw new Error('User must be authenticated');
  }

  try {
    const awardsRef = collection(db, 'team_awards');
    let querySnapshot;

    if (currentUser.role === 'admin') {
      // Admins can see all awards
      const q = query(awardsRef, orderBy('date', 'desc'));
      querySnapshot = await getDocs(q);
    } else if (currentUser.role === 'coach') {
      // Coaches see awards for their teams
      if (!currentUser.teams?.length) return [];
      // Process teams in batches of 10 (Firestore limitation)
      const awards: PracticeAward[] = [];
      for (let i = 0; i < currentUser.teams.length; i += 10) {
        const teamBatch = currentUser.teams.slice(i, i + 10);
        const q = query(
          awardsRef,
          where('teamId', 'in', teamBatch),
          orderBy('date', 'desc')
        );
        const batchSnapshot = await getDocs(q);
        batchSnapshot.forEach(doc => {
          awards.push(transformAward(doc.id, doc.data()));
        });
      }
      return awards;
    } else {
      // Players see their own awards
      const q = query(
        awardsRef,
        where('playerId', '==', currentUser.id),
        orderBy('date', 'desc')
      );
      querySnapshot = await getDocs(q);
    }

    if (!querySnapshot) return [];

    const awards: PracticeAward[] = [];
    querySnapshot.forEach((doc) => {
      awards.push(transformAward(doc.id, doc.data()));
    });

    return awards;
  } catch (error) {
    console.error('Error fetching awards:', error);
    throw handleAwardsError(error);
  }
}

export async function fetchTeamAwards(teamId: string): Promise<PracticeAward[]> {
  try {
    const awardsRef = collection(db, 'team_awards');
    const q = query(
      awardsRef,
      where('teamId', '==', teamId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const awards: PracticeAward[] = [];
    
    querySnapshot.forEach((doc) => {
      awards.push(transformAward(doc.id, doc.data()));
    });

    return awards;
  } catch (error) {
    console.error('Error fetching team awards:', error);
    throw handleAwardsError(error);
  }
}