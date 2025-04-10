import React from 'react';
import { Upload, User } from 'lucide-react';

interface Props {
  currentImage?: string;
  onChange: (imageData: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileImageUpload: React.FC<Props> = ({ 
  currentImage, 
  onChange,
  size = 'md'
}) => {
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sizes = {
    sm: {
      container: 'w-20 h-20',
      icon: 'w-8 h-8'
    },
    md: {
      container: 'w-32 h-32',
      icon: 'w-12 h-12'
    },
    lg: {
      container: 'w-40 h-40',
      icon: 'w-16 h-16'
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentImage ? (
          <img
            src={currentImage}
            alt="Profile"
            className={`${sizes[size].container} rounded-full object-cover`}
          />
        ) : (
          <div className={`${sizes[size].container} bg-gray-100 rounded-full flex items-center justify-center`}>
            <User className={`${sizes[size].icon} text-gray-400`} />
          </div>
        )}
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-sm text-gray-500">
        Recommended: Square image, max 5MB
      </p>
    </div>
  );
};