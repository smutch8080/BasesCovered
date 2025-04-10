import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { HelpArticle, HelpSection } from '../../types/help';
import { useAuth } from '../../contexts/AuthContext';
import { NewHelpArticleDialog } from '../../components/admin/help/NewHelpArticleDialog';
import { EditHelpArticleDialog } from '../../components/admin/help/EditHelpArticleDialog';
import toast from 'react-hot-toast';

function HelpArticlesPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<HelpSection | 'all'>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const articlesRef = collection(db, 'help_articles');
        const q = query(articlesRef, orderBy('section'), orderBy('order'));
        const querySnapshot = await getDocs(q);
        
        const loadedArticles: HelpArticle[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedArticles.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as HelpArticle);
        });

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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === 'all' || article.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Help Articles</h1>
        <button
          onClick={() => setShowNewDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
            hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Article
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value as HelpSection | 'all')}
            className="w-full md:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Sections</option>
            {Object.values(HelpSection).map((section) => (
              <option key={section} value={section}>
                {section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading articles...</p>
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{article.title}</h3>
                  <p className="text-sm text-brand-primary mt-1">
                    {article.section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <button
                  onClick={() => setEditingArticle(article)}
                  className="px-4 py-2 text-brand-primary hover:bg-gray-50 rounded-lg"
                >
                  Edit
                </button>
              </div>

              <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: article.content }} />

              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Articles Found</h2>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedSection !== 'all'
              ? 'Try adjusting your search filters'
              : 'No help articles available yet'}
          </p>
          <button
            onClick={() => setShowNewDialog(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Article
          </button>
        </div>
      )}

      <NewHelpArticleDialog
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onArticleCreated={(article) => {
          setArticles(prev => [...prev, article]);
          toast.success('Article created successfully');
        }}
      />

      <EditHelpArticleDialog
        isOpen={!!editingArticle}
        onClose={() => setEditingArticle(null)}
        article={editingArticle}
        onArticleUpdated={(updatedArticle) => {
          setArticles(prev => prev.map(a => 
            a.id === updatedArticle.id ? updatedArticle : a
          ));
          toast.success('Article updated successfully');
        }}
      />
    </div>
  );
}

export default HelpArticlesPage;