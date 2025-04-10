import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Scenario } from '../../types/situational';
import { fetchScenarios, fetchCompletedScenarios } from '../../services/situational';
import { HelpButton } from '../../components/help/HelpButton';
import { HelpSection } from '../../types/help';
import toast from 'react-hot-toast';

function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure user is authenticated
        if (!currentUser) {
          throw new Error('Please sign in to view scenarios');
        }

        // Load scenarios and completed status in parallel
        const [loadedScenarios, completed] = await Promise.all([
          fetchScenarios(currentUser.teams?.[0]),
          fetchCompletedScenarios(currentUser.id)
        ]);

        setScenarios(loadedScenarios);
        setCompletedScenarios(completed);
      } catch (error: any) {
        console.error('Error loading scenarios:', error);
        setError(error.message || 'Unable to load scenarios');
        toast.error(error.message || 'Unable to load scenarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, [currentUser]);

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
    const matchesCompletion = !showCompleted || completedScenarios.has(scenario.id);
    return matchesSearch && matchesDifficulty && matchesCompletion;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Game Scenarios</h1>
          <HelpButton section={HelpSection.Scenarios} />
        </div>
        {isCoach && (
          <Link
            to="/scenarios/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Scenario
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scenarios..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full md:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-gray-700">Show Completed Only</span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading scenarios...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      ) : filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => (
            <Link
              key={scenario.id}
              to={`/scenarios/${scenario.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative"
            >
              {completedScenarios.has(scenario.id) && (
                <div className="absolute top-4 right-4 text-green-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{scenario.title}</h3>
                <span className="px-3 py-1 text-sm bg-brand-gradient text-white rounded-full">
                  {scenario.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{scenario.description}</p>
              <div className="flex flex-wrap gap-2">
                {scenario.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Scenarios Found</h2>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedDifficulty !== 'all' || showCompleted
              ? 'Try adjusting your search filters'
              : 'No scenarios available yet'}
          </p>
          {isCoach && (
            <Link
              to="/scenarios/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
                hover:opacity-90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Scenario
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default ScenariosPage;