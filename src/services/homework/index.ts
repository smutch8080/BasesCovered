import { getDocs, addDoc, collection, Timestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { Homework } from '../../types/homework';
import { transformHomework } from './transformers';
import { handleHomeworkError } from './errors';

export async function fetchUserHomework(currentUser: User): Promise<Homework[]> {
  if (!currentUser) {
    throw new Error('User must be authenticated');
  }

  const homeworkRef = collection(db, 'homework');
  const loadedHomework: Homework[] = [];

  try {
    // For coaches/admins, get homework they created
    if (currentUser.role === 'coach' || currentUser.role === 'admin') {
      const createdQuery = query(
        homeworkRef,
        where('createdBy', '==', currentUser.id),
        orderBy('dueDate', 'desc')
      );
      
      const createdSnapshot = await getDocs(createdQuery);
      createdSnapshot.forEach(doc => {
        loadedHomework.push(transformHomework(doc.id, doc.data()));
      });
    }

    // Get homework for teams (if user has any teams)
    if (currentUser.teams?.length > 0) {
      // Process teams in batches of 10 (Firestore limitation)
      for (let i = 0; i < currentUser.teams.length; i += 10) {
        const teamBatch = currentUser.teams.slice(i, i + 10);
        const teamQuery = query(
          homeworkRef,
          where('teamId', 'in', teamBatch),
          orderBy('dueDate', 'desc')
        );
        
        const teamSnapshot = await getDocs(teamQuery);
        teamSnapshot.forEach(doc => {
          const data = doc.data();
          // Include if:
          // 1. User is coach/admin
          // 2. Homework is team-wide (no specific player)
          // 3. Homework is specifically assigned to this user
          if (currentUser.role === 'coach' || 
              currentUser.role === 'admin' ||
              !data.playerId || 
              data.playerId === currentUser.id) {
            const homework = transformHomework(doc.id, data);
            // Only add if not already included
            if (!loadedHomework.some(h => h.id === homework.id)) {
              loadedHomework.push(homework);
            }
          }
        });
      }
    }

    return loadedHomework.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  } catch (error) {
    console.error('Error fetching homework:', error);
    throw handleHomeworkError(error);
  }
}