import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus } from 'lucide-react';
import { Todo } from '../../types/todo';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Props {
  userId: string;
}

export const TodoWidget: React.FC<Props> = ({ userId }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadTodos = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const todosRef = collection(db, 'todos');
        let q;

        if (currentUser.role === 'coach' || currentUser.role === 'admin') {
          // Coaches see todos they created
          q = query(
            todosRef,
            where('createdBy', '==', currentUser.id),
            where('assignedTo.type', '==', 'user'),
            where('assignedTo.id', '==', userId)
          );
        } else {
          // Players/Parents see todos assigned to them
          q = query(
            todosRef,
            where('assignedTo.type', '==', 'user'),
            where('assignedTo.id', '==', currentUser.id)
          );
        }

        const querySnapshot = await getDocs(q);
        const loadedTodos: Todo[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTodos.push({
            ...data,
            id: doc.id,
            dueDate: data.dueDate?.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Todo);
        });

        setTodos(loadedTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
        // Don't show error toast for permission errors
        if (error.code !== 'permission-denied') {
          toast.error('Unable to load todos');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, [currentUser, userId]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTodo.trim()) return;

    try {
      const todoData = {
        title: newTodo.trim(),
        completed: false,
        createdBy: currentUser.id,
        assignedTo: {
          type: 'user',
          id: userId,
          name: currentUser.displayName
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'todos'), todoData);
      
      setTodos(prev => [{
        ...todoData,
        id: docRef.id,
        createdAt: todoData.createdAt.toDate(),
        updatedAt: todoData.updatedAt.toDate()
      } as Todo, ...prev]);
      
      setNewTodo('');
      toast.success('Todo added successfully');
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add todo');
    }
  };

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        completed: !completed,
        updatedAt: Timestamp.now()
      });

      setTodos(prev => prev.map(todo =>
        todo.id === todoId ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Failed to update todo');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>

      {currentUser.role === 'coach' && (
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new task..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="p-2 bg-brand-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : todos.length > 0 ? (
          todos.map((todo) => (
            <button
              key={todo.id}
              onClick={() => handleToggleTodo(todo.id, todo.completed)}
              className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg text-left"
            >
              {todo.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                {todo.title}
              </span>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No tasks yet</p>
        )}
      </div>
    </div>
  );
};