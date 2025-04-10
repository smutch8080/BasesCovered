import React, { useState } from 'react';
import { Position } from '../../../types/team';
import { Plus, X } from 'lucide-react';

interface Props {
  onSubmit: (data: {
    title: string;
    description: string;
    type: 'link' | 'file' | 'youtube' | 'other';
    url?: string;
    content?: string;
    access: {
      type: 'all' | 'parents' | 'coaches' | 'players';
      positions?: Position[];
    };
  }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    description: string;
    type: 'link' | 'file' | 'youtube' | 'other';
    url?: string;
    content?: string;
    access: {
      type: 'all' | 'parents' | 'coaches' | 'players';
      positions?: Position[];
    };
  };
  isLoading?: boolean;
}

export const ResourceForm: React.FC<Props> = ({
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
    access: {
      type: initialData?.access.type || 'all',
      positions: initialData?.access.positions || []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePosition = (position: Position) => {
    setFormData(prev => ({
      ...prev,
      access: {
        ...prev.access,
        positions: prev.access.positions?.includes(position)
          ? prev.access.positions.filter(p => p !== position)
          : [...(prev.access.positions || []), position]
      }
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

      {formData.type === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File
          </label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Handle file upload
              }
            }}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
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
          Access Level
        </label>
        <select
          value={formData.access.type}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            access: {
              type: e.target.value as 'all' | 'parents' | 'coaches' | 'players',
              positions: e.target.value === 'players' ? prev.access.positions : undefined
            }
          }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          <option value="all">Everyone</option>
          <option value="parents">Parents Only</option>
          <option value="coaches">Coaches Only</option>
          <option value="players">Players Only</option>
        </select>
      </div>

      {formData.access.type === 'players' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Limit to Positions (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Position).map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => togglePosition(position)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.access.positions?.includes(position)
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        </div>
      )}

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