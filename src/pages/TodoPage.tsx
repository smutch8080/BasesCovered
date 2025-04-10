import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Circle, Plus, Trash2, Calendar, Users } from 'lucide-react';
import { Todo, TodoAssignment } from '../types/todo';
import { AssignmentDialog } from '../components/todos/AssignmentDialog';
import toast from 'react-hot-toast';

function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TodoAssignment>({
    type: 'team',
    id: '',
    name: ''
  });
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

  useEffect(() => {
    loadTodos();
  }, [currentUser]);

  const loadTodos = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const todosRef = collection(db, 'todos');
      const q = query(
        todosRef,
        where('assignedTo.id', '==', currentUser.id),
        orderBy('createdAt', 'desc')
      );
      
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
      toast.error('Unable to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  const createTodoForUser = async (userId: string, userName: string) => {
    const todoData = {
      title: newTodo.trim(),
      completed: false,
      createdBy: currentUser!.id,
      assignedTo: {
        type: 'user',
        id: userId,
        name: userName
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...(dueDate && { dueDate: Timestamp.fromDate(new Date(dueDate)) })
    };

    await addDoc(collection(db, 'todos'), todoData);
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTodo.trim() || (isCoach && !selectedAssignment.id)) return;

    try {
      if (isCoach) {
        if (selectedAssignment.type === 'team') {
          // Get team members
          const teamDoc = await getDocs(query(
            collection(db, 'teams'),
            where('__name__', '==', selectedAssignment.id)
          ));

          if (!teamDoc.empty) {
            const teamData = teamDoc.docs[0].data();
            const players = teamData.players || [];
            
            // Create todo for each team member
            await Promise.all(players.map(player => 
              createTodoForUser(player.id, player.name)
            ));
          }
        } else if (selectedAssignment.type === 'group') {
          // Get users in the group (players or parents)
          const usersRef = collection(db, 'users');
          const groupQuery = query(
            usersRef,
            where('role', '==', selectedAssignment.id),
            where('teams', 'array-contains', currentUser.teams[0])
          );
          
          const usersSnapshot = await getDocs(groupQuery);
          await Promise.all(usersSnapshot.docs.map(doc => 
            createTodoForUser(doc.id, doc.data().displayName)
          ));
        } else {
          // Single user assignment
          await createTodoForUser(selectedAssignment.id, selectedAssignment.name);
        }
      } else {
        // Non-coach users can only create todos for themselves
        await createTodoForUser(currentUser.id, currentUser.displayName);
      }

      setNewTodo('');
      setDueDate('');
      setSelectedAssignment({
        type: 'team',
        id: '',
        name: ''
      });
      await loadTodos(); // Reload todos to show new ones
      toast.success('Todo created successfully');
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to create todo');
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

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      toast.success('Todo deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view your to dos</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My To Dos</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleAddTodo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new to do..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {isCoach && (
            <div>
              <button
                type="button"
                onClick={() => setShowAssignmentDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/5 rounded-lg"
              >
                <Users className="w-4 h-4" />
                {selectedAssignment.id ? selectedAssignment.name : 'Assign to...'}
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newTodo.trim() || (isCoach && !selectedAssignment.id)}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add To Do
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading todos...</p>
        </div>
      ) : todos.length > 0 ? (
        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm
                ${todo.completed ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  className={`p-1 rounded-full hover:bg-gray-100 ${
                    todo.completed ? 'text-green-500' : 'text-gray-400'
                  }`}
                >
                  {todo.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <div>
                  <p className={`text-gray-800 ${todo.completed ? 'line-through' : ''}`}>
                    {todo.title}
                  </p>
                  {todo.dueDate && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {todo.dueDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No To Dos Yet</h2>
          <p className="text-gray-600">
            Add your first to do to get started
          </p>
        </div>
      )}

      <AssignmentDialog
        isOpen={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        onAssign={setSelectedAssignment}
        teamId={currentUser.teams?.[0]}
      />
    </div>
  );
}

export default TodoPage;