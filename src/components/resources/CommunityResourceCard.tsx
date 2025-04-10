import React from 'react';
import { Link, FileText, Youtube, Globe } from 'lucide-react';
import { CommunityResource } from '../../types/resources';

interface Props {
  resource: CommunityResource;
}

export const CommunityResourceCard: React.FC<Props> = ({ resource }) => {
  const getResourceIcon = () => {
    switch (resource.type) {
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {getResourceIcon()}
          <h3 className="text-lg font-semibold text-gray-800">{resource.title}</h3>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{resource.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm">
            {resource.category}
          </span>
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-primary hover:opacity-90"
          >
            View Resource
            <Link className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};