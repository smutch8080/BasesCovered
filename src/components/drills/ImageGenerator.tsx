import React, { useState } from 'react';
import { Image, Loader2 } from 'lucide-react';
import { generateDrillImage } from '../../lib/openai';
import { DrillCategory } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  name: string;
  description: string;
  category: DrillCategory;
  onImageGenerated: (imageUrl: string) => void;
}

export const ImageGenerator: React.FC<Props> = ({
  name,
  description,
  category,
  onImageGenerated
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateImage = async () => {
    try {
      setIsLoading(true);
      const imageUrl = await generateDrillImage({ name, description, category });
      
      if (imageUrl) {
        onImageGenerated(imageUrl);
        toast.success('Image generated successfully');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerateImage}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
        hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Image className="w-4 h-4" />
          Generate Image
        </>
      )}
    </button>
  );
};