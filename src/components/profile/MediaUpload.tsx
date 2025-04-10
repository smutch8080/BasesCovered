import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Film, Edit2 } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { MediaItem } from '../../types/media';
import { addPlayerMedia, updatePlayerMedia, deletePlayerMedia } from '../../services/media';
import toast from 'react-hot-toast';

interface Props {
  playerId: string;
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  maxImages?: number;
  maxVideos?: number;
}

export const MediaUpload: React.FC<Props> = ({
  playerId,
  media,
  onMediaChange,
  maxImages = 10,
  maxVideos = 3
}) => {
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentImages = media.filter(item => item.type === 'image');
  const currentVideos = media.filter(item => item.type === 'video');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      console.log('Files dropped:', acceptedFiles);

      // Validate file counts
      const images = acceptedFiles.filter(file => file.type.startsWith('image/'));
      const videos = acceptedFiles.filter(file => file.type.startsWith('video/'));

      if (currentImages.length + images.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      if (currentVideos.length + videos.length > maxVideos) {
        toast.error(`Maximum ${maxVideos} videos allowed`);
        return;
      }

      // Process files
      const uploadPromises = acceptedFiles.map(async file => {
        // Validate file size
        if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
          throw new Error('Images must be under 5MB');
        }
        if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
          throw new Error('Videos must be under 50MB');
        }

        const type = file.type.startsWith('image/') ? 'image' : 'video';
        
        const newMedia = await addPlayerMedia(playerId, file, {
          type,
          playerId,
          privacy: 'public',
          featured: false
        });

        return newMedia;
      });

      const newMedia = await Promise.all(uploadPromises);
      onMediaChange([...media, ...newMedia]);
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  }, [media, onMediaChange, currentImages.length, currentVideos.length, maxImages, maxVideos, playerId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov']
    },
    disabled: isUploading
  });

  const handleRemoveItem = async (id: string) => {
    try {
      await deletePlayerMedia(id);
      onMediaChange(media.filter(item => item.id !== id));
      toast.success('Media removed successfully');
    } catch (error) {
      console.error('Error removing media:', error);
      toast.error('Failed to remove media');
    }
  };

  const handleUpdateItem = async (updatedItem: MediaItem) => {
    try {
      await updatePlayerMedia(updatedItem.id, updatedItem);
      onMediaChange(media.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      setEditItem(null);
      toast.success('Media updated successfully');
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Failed to update media');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-300 hover:border-brand-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-8 h-8 mx-auto mb-4 ${isDragActive ? 'text-brand-primary' : 'text-gray-400'}`} />
        {isUploading ? (
          <p className="text-gray-600">Uploading files...</p>
        ) : isDragActive ? (
          <p className="text-brand-primary">Drop files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">Drag & drop files here, or click to select files</p>
            <p className="text-sm text-gray-500">
              Supports images (jpg, png, gif) and videos (mp4, mov)
            </p>
            <p className="text-sm text-gray-500">
              Max {maxImages} images and {maxVideos} videos
            </p>
          </div>
        )}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((item) => (
          <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.caption || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditItem(item)}
                  className="p-1 bg-white rounded-full text-gray-700 hover:text-brand-primary"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onClose={() => setEditItem(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Edit Media
            </Dialog.Title>

            {editItem && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editItem) handleUpdateItem(editItem);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={editItem.caption || ''}
                    onChange={(e) => setEditItem({
                      ...editItem,
                      caption: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privacy
                  </label>
                  <select
                    value={editItem.privacy}
                    onChange={(e) => setEditItem({
                      ...editItem,
                      privacy: e.target.value as 'public' | 'private' | 'friends'
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editItem.featured}
                      onChange={(e) => setEditItem({
                        ...editItem,
                        featured: e.target.checked
                      })}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Feature this item
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};