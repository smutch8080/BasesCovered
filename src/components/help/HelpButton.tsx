import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HelpSection } from '../../types/help';
import { getHelpLink } from '../../services/help';

interface Props {
  section: HelpSection;
  articleId?: string;
  className?: string;
}

export const HelpButton: React.FC<Props> = ({ section, articleId, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <a
        href={getHelpLink(section, articleId)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center p-2 text-gray-500 hover:text-brand-primary 
          hover:bg-gray-100 rounded-full transition-colors ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <HelpCircle className="w-5 h-5" />
      </a>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
          text-xs text-white bg-gray-800 rounded whitespace-nowrap">
          View Help Article
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 
            border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
};