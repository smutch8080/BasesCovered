import React from 'react';
import { X, FileText, Image, Music } from 'lucide-react';

interface FileUploadProgressProps {
  file: {
    id?: string;
    name: string;
    type: string;
    size: number;
    progress: number;
    preview?: string;
    error?: string;
  };
  onCancel: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  file,
  onCancel
}) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return file.preview ? (
        <img 
          src={file.preview} 
          alt={file.name} 
          className="w-10 h-10 object-cover rounded"
        />
      ) : (
        <Image className="w-6 h-6 text-blue-500" />
      );
    } else if (file.type.startsWith('audio/')) {
      return <Music className="w-6 h-6 text-purple-500" />;
    } else {
      return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className={`relative p-3 rounded-lg mb-2 ${
      file.error 
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
        : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
            
            <button
              onClick={onCancel}
              className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
              title="Cancel upload"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {file.error ? (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {file.error}
            </p>
          ) : (
            <>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {file.progress < 100 
                  ? `Uploading: ${file.progress}%` 
                  : 'Upload complete'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 