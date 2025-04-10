import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { HelpSection, HelpArticle } from '../../../types/help';
import { RichTextEditor } from '../../editor/RichTextEditor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  article: HelpArticle | null;
  onArticleUpdated: (article: HelpArticle) => void;
}

export const EditHelpArticleDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  article,
  onArticleUpdated
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [section, setSection] = useState<HelpSection>(HelpSection.GettingStarted);
  const [order, setOrder] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setSection(article.section);
      setOrder(article.order);
      setTags(article.tags);
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    try {
      setIsLoading(true);
      const articleRef = doc(db, 'help_articles', article.id);
      const updateData = {
        title: title.trim(),
        content,
        section,
        order,
        tags,
        updatedAt: Timestamp.now()
      };

      await updateDoc(articleRef, updateData);
      
      const updatedArticle: HelpArticle = {
        ...article,
        ...updateData,
        updatedAt: updateData.updatedAt.toDate()
      };

      onArticleUpdated(updatedArticle);
      onClose();
    } catch (error) {
      console.error('Error updating help article:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!article) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            Edit Help Article
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter article title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as HelpSection)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                >
                  {Object.values(HelpSection).map((section) => (
                    <option key={section} value={section}>
                      {section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  required
                  min={0}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                height={400}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};