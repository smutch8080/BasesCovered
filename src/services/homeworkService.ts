import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Homework } from '../types/homework';
import { User } from '../types/auth';

export async function fetchUserHomework(currentUser: User): Promise<Homework[]> {
  if (!currentUser) {
    throw new Error('User must be authenticated');
  }

  const homeworkRef = collection(db, 'todos');
  const loadedHomework: Homework[] = [];

  try {
    // Build query based on user role and assignments
    let constraints = [];

    if (currentUser.role === 'coach' || currentUser.role === 'admin') {
      // Coaches see todos they created
      constraints.push(where('createdBy', '==', currentUser.id));
    } else {
      // Players/Parents see todos assigned to them or their groups
      constraints.push(
        where('assignedTo.type', 'in', ['user', 'group', 'team']),
        where('assignedTo.id', 'in', [
          currentUser.id,
          currentUser.role, // 'player' or 'parent'
          ...(currentUser.teams || []) // Include team assignments
        ])
      );
    }

    const q = query(
      homeworkRef,
      ...constraints,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      const data = doc.data();
      loadedHomework.push(transformHomework(doc.id, data));
    });

    return loadedHomework.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  } catch (error) {
    console.error('Error fetching homework:', error);
    throw error;
  }
}

function transformHomework(id: string, data: any): Homework {
  return {
    ...data,
    id,
    dueDate: data.dueDate.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    submissions: data.submissions || []
  } as Homework;
}