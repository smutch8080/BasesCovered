import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/auth';
import { Todo } from '../../types/todo';

export async function fetchTasks(currentUser: User): Promise<Todo[]> {
  if (!currentUser) {
    throw new Error('User must be authenticated');
  }

  try {
    const todosRef = collection(db, 'todos');
    let constraints = [];

    if (currentUser.role === 'coach' || currentUser.role === 'admin') {
      // Coaches see todos they created
      constraints.push(where('createdBy', '==', currentUser.id));
    } else {
      // Players/Parents see todos assigned to them or their groups
      const possibleAssignments = [
        currentUser.id, // Direct assignments
        currentUser.role, // Role-based group assignments
        ...(currentUser.teams || []) // Team assignments
      ];

      constraints.push(
        where('assignedTo.id', 'in', possibleAssignments)
      );
    }

    const q = query(
      todosRef,
      ...constraints,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const todos: Todo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      todos.push({
        ...data,
        id: doc.id,
        dueDate: data.dueDate?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Todo);
    });

    return todos;
  } catch (error) {
    console.error('Error loading todos:', error);
    throw error;
  }
}