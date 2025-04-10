import React from 'react';

interface Props {
  title: string;
  content: string;
}

export const LessonSection: React.FC<Props> = ({ title, content }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <div 
        className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-primary hover:prose-a:text-brand-secondary"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};