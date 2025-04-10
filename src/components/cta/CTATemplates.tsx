import React from 'react';
import { ArrowRight, AlertTriangle, Info, Star } from 'lucide-react';
import { CTATemplate, CTAContent } from '../../types/cta';

interface CTATemplateProps {
  content: CTAContent;
  className?: string;
}

export const CTATemplates: React.FC<CTATemplateProps> = ({ content, className = '' }) => {
  const renderTemplate = () => {
    switch (content.template) {
      case CTATemplate.Hero:
        return (
          <div className="relative overflow-hidden rounded-lg">
            {content.imageUrl && (
              <div className="absolute inset-0">
                <img 
                  src={content.imageUrl} 
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
              </div>
            )}
            <div className="relative p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{content.title}</h3>
              <p className="text-white/90 text-lg mb-6 max-w-xl">{content.content}</p>
              {content.buttonText && content.buttonLink && (
                <a
                  href={content.buttonLink}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary rounded-lg
                    hover:bg-opacity-90 transition-colors"
                >
                  {content.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );

      case CTATemplate.Feature:
        return (
          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              {content.imageUrl && (
                <div className="md:w-1/2">
                  <img 
                    src={content.imageUrl} 
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8 md:p-12 md:w-1/2">
                <h3 className="text-2xl font-bold text-white mb-4">{content.title}</h3>
                <p className="text-white/90 mb-6">{content.content}</p>
                {content.buttonText && content.buttonLink && (
                  <a
                    href={content.buttonLink}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary rounded-lg
                      hover:bg-opacity-90 transition-colors"
                  >
                    {content.buttonText}
                    <Star className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case CTATemplate.Alert:
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">{content.title}</h3>
                <p className="text-yellow-700 mt-1">{content.content}</p>
                {content.buttonText && content.buttonLink && (
                  <a
                    href={content.buttonLink}
                    className="inline-flex items-center gap-2 mt-3 text-yellow-800 hover:text-yellow-900"
                  >
                    {content.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );

      case CTATemplate.Banner:
        return (
          <div className="bg-brand-primary text-white px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">{content.title}</h3>
                  <p className="text-white/90">{content.content}</p>
                </div>
              </div>
              {content.buttonText && content.buttonLink && (
                <a
                  href={content.buttonLink}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-primary rounded-lg
                    hover:bg-opacity-90 transition-colors whitespace-nowrap"
                >
                  {content.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );

      case CTATemplate.Card:
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {content.imageUrl && (
              <img 
                src={content.imageUrl} 
                alt={content.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{content.title}</h3>
              <p className="text-gray-600 mb-4">{content.content}</p>
              {content.buttonText && content.buttonLink && (
                <a
                  href={content.buttonLink}
                  className="inline-flex items-center gap-2 text-brand-primary hover:opacity-90"
                >
                  {content.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );

      case CTATemplate.Basic:
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{content.title}</h3>
            <p className="text-gray-600 mb-4">{content.content}</p>
            {content.buttonText && content.buttonLink && (
              <a
                href={content.buttonLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                  hover:opacity-90 transition-colors"
              >
                {content.buttonText}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {renderTemplate()}
    </div>
  );
};
