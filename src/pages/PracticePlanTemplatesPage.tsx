import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PracticePlanTemplate, DrillCategory } from '../types';
import { Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function PracticePlanTemplatesPage() {
  const [templates, setTemplates] = useState<PracticePlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | 'all'>('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const templatesRef = collection(db, 'practice_plans');
        const q = query(
          templatesRef,
          where('isTemplate', '==', true),
          orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedTemplates: PracticePlanTemplate[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTemplates.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as PracticePlanTemplate);
        });

        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast.error('Unable to load practice plan templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      template.categories.includes(selectedCategory as DrillCategory);
    
    const matchesSkillLevel = selectedSkillLevel === 'all' || 
      template.skillLevel === selectedSkillLevel;

    return matchesSearch && matchesCategory && matchesSkillLevel;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Practice Plan Templates</h1>
        {isAdmin && (
          <Link
            to="/practice-plan/new?template=true"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DrillCategory | 'all')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Categories</option>
              {Object.values(DrillCategory).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSkillLevel}
              onChange={(e) => setSelectedSkillLevel(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading templates...</p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{template.name}</h3>
                  <span className="inline-block px-3 py-1 bg-brand-gradient text-white text-sm rounded-full mt-2">
                    {template.skillLevel.charAt(0).toUpperCase() + template.skillLevel.slice(1)}
                  </span>
                </div>
                {template.featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {template.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {template.drills.length} drills
                </span>
                <Link
                  to={`/practice-plan/new?template=${template.id}`}
                  className="text-brand-primary hover:opacity-90"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Templates Found</h2>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' || selectedSkillLevel !== 'all'
              ? 'Try adjusting your search filters'
              : 'No practice plan templates available yet'}
          </p>
        </div>
      )}
    </div>
  );
}

export default PracticePlanTemplatesPage;