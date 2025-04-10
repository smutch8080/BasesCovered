import React, { useState } from 'react';
import { Video, Loader2 } from 'lucide-react';
import { searchYouTubeVideos } from '../../lib/youtube';
import { Resource } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  drill: {
    name: string;
    category: string;
    description: string;
  };
  onVideosFound: (videos: Resource[]) => void;
}

export const VideoSearch: React.FC<Props> = ({ drill, onVideosFound }) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!drill.name || !drill.category) {
      toast.error('Please fill in the drill name and category first');
      return;
    }

    try {
      setIsSearching(true);
      const videos = await searchYouTubeVideos(drill);
      
      if (videos.length > 0) {
        onVideosFound(videos);
        toast.success('Found relevant videos');
      } else {
        toast.error('No relevant videos found');
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      toast.error('Failed to search for videos');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <button
      onClick={handleSearch}
      disabled={isSearching}
      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
        hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSearching ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Video className="w-4 h-4" />
          Find Videos
        </>
      )}
    </button>
  );
};