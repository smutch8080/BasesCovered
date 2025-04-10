import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ResourceType, LeagueResource } from '../../../types/resources';
import { Team } from '../../../types/team';

interface Props {
  onSubmit: (data: Omit<LeagueResource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  teams: Team[];
  initialData?: LeagueResource;
  isLoading?: boolean;
}

export const LeagueResourceForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  teams,
  initialData,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || ResourceType.Link,
    url: initialData?.url || '',
    content: initialData?.content || '',
    access: {
      type: initialData?.access.type || 'all',
      teamIds: initialData?.access.teamIds || []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      leagueId: initialData?.leagueId || '',
      createdBy: initialData?.createdBy || ''
    });
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
          required
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
            type: e.target.value as ResourceType,
            url: '',
            content: ''
          }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          {Object.values(ResourceType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {formData.type === ResourceType.Link && (
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

      {formData.type === ResourceType.Other && (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Access Level
        </label>
        <select
          value={formData.access.type}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            access: {
              type: e.target.value as 'all' | 'coaches' | 'teams',
              teamIds: e.target.value === 'teams' ? prev.access.teamIds : []
            }
          }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          <option value="all">All Teams</option>
          <option value="coaches">Coaches Only</option>
          <option value="teams">Specific Teams</option>
        </select>
      </div>

      {formData.access.type === 'teams' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Teams
          </label>
          <div className="space-y-2">
            {teams.map(team => (
              <label key={team.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.access.teamIds?.includes(team.id)}
                  onChange={(e) => {
                    const teamIds = formData.access.teamIds || [];
                    setFormData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        teamIds: e.target.checked
                          ? [...teamIds, team.id]
                          : teamIds.filter(id => id !== team.id)
                      }
                    }));
                  }}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span>{team.name}</span>
              </label>
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