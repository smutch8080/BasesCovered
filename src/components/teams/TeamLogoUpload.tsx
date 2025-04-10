import React from 'react';
import { Upload, Shield } from 'lucide-react';

interface Props {
  currentLogo?: string;
  onChange: (imageData: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const TeamLogoUpload: React.FC<Props> = ({ 
  currentLogo, 
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

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
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
        {currentLogo ? (
          <img
            src={currentLogo}
            alt="Team Logo"
            className={`${sizes[size].container} rounded-full object-cover`}
          />
        ) : (
          <div className={`${sizes[size].container} bg-gray-100 rounded-full flex items-center justify-center`}>
            <Shield className={`${sizes[size].icon} text-gray-400`} />
          </div>
        )}
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload Logo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-sm text-gray-500">
        Recommended: Square image, max 2MB
      </p>
    </div>
  );
};