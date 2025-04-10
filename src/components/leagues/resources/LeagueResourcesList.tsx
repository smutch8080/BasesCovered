import React from 'react';
import { Link, FileText, Youtube, Globe, Trash2, Edit } from 'lucide-react';
import { LeagueResource } from '../../../types/resources';
import { Team } from '../../../types/team';

interface Props {
  resources: LeagueResource[];
  teams: Team[];
  onEdit?: (resource: LeagueResource) => void;
  onDelete?: (resourceId: string) => void;
}

export const LeagueResourcesList: React.FC<Props> = ({ resources, teams, onEdit, onDelete }) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-600" />;
      case 'link':
        return <Globe className="w-5 h-5 text-blue-600" />;
      case 'file':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <Link className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAccessLabel = (access: LeagueResource['access']) => {
    if (access.type === 'all') return 'All Teams';
    if (access.type === 'coaches') return 'Coaches Only';
    if (access.type === 'teams' && access.teamIds?.length) {
      const teamNames = access.teamIds
        .map(id => teams.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      return `Teams: ${teamNames}`;
    }
    return 'Unknown Access';
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No resources available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {getResourceIcon(resource.type)}
              <div>
                <h3 className="font-medium text-gray-800">{resource.title}</h3>
                <p className="text-sm text-gray-500">{resource.description}</p>
              </div>
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(resource)}
                    className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(resource.id)}
                    className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              {getAccessLabel(resource.access)}
            </span>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:opacity-90 text-sm"
              >
                View Resource
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};