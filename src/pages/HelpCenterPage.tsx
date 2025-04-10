import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpArticle, HelpSection } from '../types/help';
import { fetchHelpArticles } from '../services/help';
import { BookOpen, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function HelpCenterPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const loadedArticles = await fetchHelpArticles();
        setArticles(loadedArticles);
      } catch (error) {
        console.error('Error loading help articles:', error);
        toast.error('Unable to load help articles');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Group articles by section
  const articlesBySection = articles.reduce((acc, article) => {
    if (!acc[article.section]) {
      acc[article.section] = [];
    }
    acc[article.section].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-brand-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Help Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(articlesBySection).map(([section, sectionArticles]) => (
          <div key={section} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <div className="space-y-3">
              {sectionArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/help/${article.section}/${article.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group"
                >
                  <span className="text-gray-700 group-hover:text-brand-primary">
                    {article.title}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-primary" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HelpCenterPage;