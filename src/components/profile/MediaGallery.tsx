import React from 'react';
import { Image as ImageIcon, Film } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  privacy: 'public' | 'private' | 'friends';
  featured: boolean;
}

interface Props {
  media: MediaItem[];
  onMediaClick?: (item: MediaItem) => void;
}

export const MediaGallery: React.FC<Props> = ({ media, onMediaClick }) => {
  const featuredItem = media.find(item => item.featured);
  const regularItems = media.filter(item => !item.featured);

  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No media content yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Item */}
      {featuredItem && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured</h3>
          <div
            onClick={() => onMediaClick?.(featuredItem)}
            className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
          >
            {featuredItem.type === 'image' ? (
              <img
                src={featuredItem.url}
                alt={featuredItem.caption || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={featuredItem.url}
                className="w-full h-full object-cover"
                controls
              />
            )}
            {featuredItem.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <p className="text-white">{featuredItem.caption}</p>
              </div>
            )}
            <div className="absolute top-4 right-4 px-3 py-1 bg-brand-primary text-white text-sm rounded-full">
              Featured
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {regularItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onMediaClick?.(item)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.caption || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/60 transition-colors">
                  <Film className="w-8 h-8 text-white" />
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm">{item.caption}</p>
                </div>
              )}
            </div>

            {/* Type & Privacy Badge */}
            <div className="absolute top-2 right-2 flex gap-2">
              <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                {item.type === 'image' ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <Film className="w-3 h-3" />
                )}
              </span>
              {item.privacy !== 'public' && (
                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                  {item.privacy}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};