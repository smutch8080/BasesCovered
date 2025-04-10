import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Props {
  onSubmit: (data: {
    title: string;
    description: string;
    type: 'link' | 'file' | 'youtube' | 'other';
    url?: string;
    content?: string;
    category: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    description: string;
    type: 'link' | 'file' | 'youtube' | 'other';
    url?: string;
    content?: string;
    category: string;
    tags: string[];
  };
  isLoading?: boolean;
}

export const CommunityResourceForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'link',
    url: initialData?.url || '',
    content: initialData?.content || '',
    category: initialData?.category || 'other',
    tags: initialData?.tags || []
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter resource title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Enter resource description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          <option value="drills">Drills</option>
          <option value="coaching">Coaching</option>
          <option value="training">Training</option>
          <option value="rules">Rules</option>
          <option value="equipment">Equipment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resource Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            type: e.target.value as 'link' | 'file' | 'youtube' | 'other',
            url: '',
            content: ''
          }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          <option value="link">Link</option>
          <option value="file">File Upload</option>
          <option value="youtube">YouTube Video</option>
          <option value="other">Other</option>
        </select>
      </div>

      {formData.type === 'link' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter resource URL"
          />
        </div>
      )}

      {formData.type === 'youtube' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter YouTube video URL"
          />
        </div>
      )}

      {formData.type === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Enter resource content"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            placeholder="Add tags..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="p-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.title.trim()}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Resource'}
        </button>
      </div>
    </form>
  );
};