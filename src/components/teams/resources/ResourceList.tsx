import React from 'react';
import { Link, FileText, Youtube, Globe, Trash2, Edit } from 'lucide-react';
import { TeamResource } from '../../../types/resources';
import { Position } from '../../../types/team';
import { useAuth } from '../../../contexts/AuthContext';

interface Props {
  resources: TeamResource[];
  onEdit?: (resource: TeamResource) => void;
  onDelete?: (resourceId: string) => void;
}

export const ResourceList: React.FC<Props> = ({ resources, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';

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

  const getAccessLabel = (access: { type: string; positions?: Position[] } | undefined) => {
    if (!access) return 'Everyone';
    
    let label = access.type === 'all' ? 'Everyone' : `${access.type} Only`;
    if (access.positions?.length) {
      label += ` (${access.positions.join(', ')})`;
    }
    return label;
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
            {isCoach && onEdit && onDelete && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(resource)}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(resource.id)}
                  className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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