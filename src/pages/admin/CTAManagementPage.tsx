import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CTAContent, CTALocation, CTATemplate } from '../../types/cta';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, Plus, Edit2, Eye, Calendar } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { CTATemplates } from '../../components/cta/CTATemplates';
import toast from 'react-hot-toast';
import { PageLayout } from '../../components/layout/PageLayout';

export default function CTAManagementPage() {
  const [locations, setLocations] = useState<CTALocation[]>([]);
  const [content, setContent] = useState<CTAContent[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CTAContent>>({
    title: '',
    content: '',
    buttonText: '',
    buttonLink: '',
    imageUrl: '',
    roles: [],
    priority: 1,
    active: true,
    template: CTATemplate.Basic,
    backgroundColor: '',
    textColor: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load locations
        const locationsRef = collection(db, 'cta_locations');
        const locationsSnapshot = await getDocs(locationsRef);
        const loadedLocations: CTALocation[] = [];
        locationsSnapshot.forEach(doc => {
          loadedLocations.push({
            ...doc.data(),
            id: doc.id
          } as CTALocation);
        });
        setLocations(loadedLocations);

        // Load content
        const contentRef = collection(db, 'cta_content');
        const contentSnapshot = await getDocs(contentRef);
        const loadedContent: CTAContent[] = [];
        contentSnapshot.forEach(doc => {
          const data = doc.data();
          loadedContent.push({
            ...data,
            id: doc.id,
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as CTAContent);
        });
        setContent(loadedContent);
      } catch (error) {
        console.error('Error loading CTA data:', error);
        toast.error('Failed to load CTA data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedLocation) return;

    try {
      const now = new Date();
      const contentData = {
        ...formData,
        locationId: selectedLocation,
        startDate: formData.startDate ? Timestamp.fromDate(new Date(formData.startDate)) : null,
        endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      if (formData.id) {
        // Update existing content
        const contentRef = doc(db, 'cta_content', formData.id);
        await updateDoc(contentRef, {
          ...contentData,
          updatedAt: Timestamp.fromDate(now)
        });
        toast.success('CTA content updated successfully');
      } else {
        // Create new content
        const contentRef = collection(db, 'cta_content');
        await addDoc(contentRef, contentData);
        toast.success('CTA content created successfully');
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        buttonText: '',
        buttonLink: '',
        imageUrl: '',
        roles: [],
        priority: 1,
        active: true,
        template: CTATemplate.Basic,
        backgroundColor: '',
        textColor: ''
      });
      setIsEditing(false);

      // Reload content
      const contentRef = collection(db, 'cta_content');
      const q = query(contentRef, where('locationId', '==', selectedLocation));
      const snapshot = await getDocs(q);
      const updatedContent: CTAContent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        updatedContent.push({
          ...data,
          id: doc.id,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as CTAContent);
      });
      setContent(updatedContent);
    } catch (error) {
      console.error('Error saving CTA content:', error);
      toast.error('Failed to save CTA content');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-bold text-gray-800">CTA Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Location Selection & Content List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Locations</h2>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select location...</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedLocation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Content</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
                      hover:opacity-90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Content
                  </button>
                </div>

                <div className="space-y-4">
                  {content
                    .filter(c => c.locationId === selectedLocation)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.active ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-800">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Priority: {item.priority}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setFormData(item);
                                setIsEditing(true);
                              }}
                              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                // Preview functionality
                              }}
                              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {(item.startDate || item.endDate) && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {item.startDate?.toLocaleDateString()} - {item.endDate?.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Content Form */}
          {isEditing && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {formData.id ? 'Edit Content' : 'New Content'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Style
                    </label>
                    <select
                      value={formData.template || CTATemplate.Basic}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        template: e.target.value as CTATemplate 
                      }))}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    >
                      {Object.entries(CTATemplate).map(([key, value]) => (
                        <option key={value} value={value}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Link
                      </label>
                      <input
                        type="url"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Roles
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.values(UserRole).map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.roles?.includes(role)}
                            onChange={(e) => {
                              const roles = formData.roles || [];
                              setFormData(prev => ({
                                ...prev,
                                roles: e.target.checked
                                  ? [...roles, role]
                                  : roles.filter(r => r !== role)
                              }));
                            }}
                            className="rounded text-brand-primary focus:ring-brand-primary"
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.startDate?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          startDate: e.target.value ? new Date(e.target.value) : undefined
                        }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          endDate: e.target.value ? new Date(e.target.value) : undefined
                        }))}
                        min={formData.startDate?.toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        priority: parseInt(e.target.value) || 1
                      }))}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          active: e.target.checked
                        }))}
                        className="rounded text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Preview</h3>
                    <div className="border rounded-lg p-4">
                      <CTATemplates 
                        content={{
                          ...formData,
                          id: formData.id || 'preview',
                          createdAt: new Date(),
                          updatedAt: new Date()
                        } as CTAContent} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          title: '',
                          content: '',
                          buttonText: '',
                          buttonLink: '',
                          imageUrl: '',
                          roles: [],
                          priority: 1,
                          active: true,
                          template: CTATemplate.Basic
                        });
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                    >
                      {formData.id ? 'Update' : 'Create'} CTA
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}