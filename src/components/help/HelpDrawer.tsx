import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import { HelpSection, HelpArticle } from '../../types/help';
import { fetchHelpArticles } from '../../services/help';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  section?: HelpSection;
  articleId?: string;
}

export const HelpDrawer: React.FC<Props> = ({ isOpen, onClose, section, articleId }) => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const loadedArticles = await fetchHelpArticles(section);
        setArticles(loadedArticles);
      } catch (error) {
        console.error('Error loading help articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadArticles();
    }
  }, [isOpen, section]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform 
      duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Help Center</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search help articles..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="divide-y">
              {filteredArticles.map((article) => (
                <a
                  key={article.id}
                  href={`/help/${article.section}/${article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{article.title}</h3>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-gray-500 mb-2">No articles found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};