import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus } from 'lucide-react';
import { fetchTasks, addTask, updateTaskStatus } from '../../services/dashboard/tasks';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
}

export const TaskList: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const loadedTasks = await fetchTasks(currentUser);
        setTasks(loadedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Unable to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentUser]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTask.trim()) return;

    try {
      await addTask(currentUser.id, newTask.trim());
      const loadedTasks = await fetchTasks(currentUser);
      setTasks(loadedTasks);
      setNewTask('');
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskStatus(taskId, !completed);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>

      <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="p-2 bg-brand-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id, task.completed)}
            className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg text-left"
          >
            {task.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </button>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 py-4">No tasks yet</p>
        )}
      </div>
    </div>
  );
};