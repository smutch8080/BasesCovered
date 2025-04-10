import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { DrillCategory } from '../types';
import { useStore } from '../store';
import { Resource } from '../types';
import { AIDrillGenerator } from '../components/drills/AIDrillGenerator';
import { VideoSearch } from '../components/drills/VideoSearch';
import { ImageGenerator } from '../components/drills/ImageGenerator';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function AddDrillPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [whatToLookFor, setWhatToLookFor] = useState('');
  const [category, setCategory] = useState<DrillCategory | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [duration, setDuration] = useState(15);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [newResource, setNewResource] = useState({
    type: 'video' as const,
    title: '',
    url: ''
  });

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEquipment.trim()) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResource.title && newResource.url) {
      setResources([...resources, { ...newResource }]);
      setNewResource({
        type: 'video',
        title: '',
        url: ''
      });
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    try {
      await useStore.getState().addDrill({
        name,
        shortDescription,
        description,
        whatToLookFor,
        category,
        experienceLevel,
        duration,
        equipment,
        resources,
        imageUrl
      });

      toast.success('Drill added successfully');
      navigate('/drills');
    } catch (error) {
      console.error('Error adding drill:', error);
      toast.error('Failed to add drill');
    }
  };

  const handleGenerateContent = (drillData: {
    name: string;
    shortDescription: string;
    description: string;
    whatToLookFor: string;
    equipment: string[];
  }) => {
    setName(drillData.name);
    setShortDescription(drillData.shortDescription);
    setDescription(drillData.description);
    setWhatToLookFor(drillData.whatToLookFor);
    setEquipment(drillData.equipment);
  };

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Drill</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DrillCategory)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Select category...</option>
                  {Object.values(DrillCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {category && (
              <AIDrillGenerator
                category={category}
                experienceLevel={experienceLevel}
                onGenerated={handleGenerateContent}
              />
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drill Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter drill name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Brief description of the drill"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Detailed description of how to run the drill"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What to Look For
                </label>
                <textarea
                  value={whatToLookFor}
                  onChange={(e) => setWhatToLookFor(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="What coaches should observe during this drill"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  required
                  min="5"
                  max="60"
                  step="5"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Drill Image</h2>
              <div className="flex gap-2">
                <ImageGenerator
                  name={name}
                  description={description}
                  category={category as DrillCategory}
                  onImageGenerated={setImageUrl}
                />
              </div>
            </div>

            {imageUrl && (
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img 
                  src={imageUrl} 
                  alt={name}
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full
                    hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Equipment</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Add equipment..."
                />
                <button
                  type="button"
                  onClick={handleAddEquipment}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {equipment.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Resources</h2>
              <div className="flex gap-2">
                <VideoSearch
                  drill={{
                    name,
                    category: category as string,
                    description
                  }}
                  onVideosFound={(videos) => {
                    setResources([...resources, ...videos]);
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({
                    ...newResource,
                    type: e.target.value as 'video' | 'document' | 'link'
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({
                    ...newResource,
                    title: e.target.value
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Resource title..."
                />
              </div>
              <div>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({
                    ...newResource,
                    url: e.target.value
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="URL..."
                />
              </div>
            </div>

            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{resource.title}</span>
                    <span className="ml-2 text-sm text-gray-500">({resource.type})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to="/drills"
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Add Drill
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}