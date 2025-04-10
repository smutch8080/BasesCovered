import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HelpArticle, HelpSection } from '../types/help';
import { fetchHelpArticles } from '../services/help';
import toast from 'react-hot-toast';

function HelpArticlePage() {
  const { section, articleId } = useParams<{ section: string; articleId?: string }>();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const loadedArticles = await fetchHelpArticles(section as HelpSection);
        setArticles(loadedArticles);
      } catch (error) {
        console.error('Error loading help articles:', error);
        toast.error('Unable to load help articles');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [section]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  const currentArticle = articleId 
    ? articles.find(a => a.id === articleId)
    : articles[0];

  if (!currentArticle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Article not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/help"
          className="flex items-center gap-2 text-brand-primary hover:opacity-90"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Help Center
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{currentArticle.title}</h1>
          
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
          
          {currentArticle.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-wrap gap-2">
                {currentArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentArticle.relatedArticles.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Related Articles</h2>
              <div className="space-y-2">
                {currentArticle.relatedArticles.map((articleId) => {
                  const article = articles.find(a => a.id === articleId);
                  if (!article) return null;
                  return (
                    <Link
                      key={articleId}
                      to={`/help/${article.section}/${article.id}`}
                      className="block text-brand-primary hover:opacity-90"
                    >
                      {article.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HelpArticlePage;