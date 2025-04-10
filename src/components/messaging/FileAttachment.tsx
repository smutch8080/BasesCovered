import React from 'react';
import { Download, File, FileImage, FileAudio, FileVideo, FileText } from 'lucide-react';
import { Attachment } from '../../services/messaging/types';

interface FileAttachmentProps {
  attachment: Attachment;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ attachment }) => {
  // Determine if the attachment is an image that can be previewed
  const isPreviewableImage = attachment.type?.startsWith('image/') && 
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(attachment.type);
  
  // Determine if the attachment is audio that can be played
  const isAudio = attachment.type?.startsWith('audio/');
  
  // Determine if the attachment is video that can be played
  const isVideo = attachment.type?.startsWith('video/');
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (attachment.type?.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (attachment.type?.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    if (attachment.type?.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (attachment.type?.startsWith('text/')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Image preview */}
      {isPreviewableImage && attachment.url && (
        <div className="relative group">
          <img 
            src={attachment.url} 
            alt={attachment.name || 'Image attachment'} 
            className="max-h-80 w-auto object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <a 
              href={attachment.url} 
              download={attachment.name}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-background rounded-full"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
      
      {/* Audio player */}
      {isAudio && attachment.url && (
        <div className="p-3">
          <audio controls className="w-full">
            <source src={attachment.url} type={attachment.type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {/* Video player */}
      {isVideo && attachment.url && (
        <div className="p-3">
          <video controls className="max-h-80 max-w-full">
            <source src={attachment.url} type={attachment.type} />
            Your browser does not support the video element.
          </video>
        </div>
      )}
      
      {/* File info (shown for all attachments) */}
      <div className="p-3 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center">
          {getFileIcon()}
          <div className="ml-2">
            <div className="text-sm font-medium truncate max-w-[200px]">
              {attachment.name || 'Unnamed file'}
            </div>
            {attachment.size && (
              <div className="text-xs text-muted-foreground">
                {formatFileSize(attachment.size)}
              </div>
            )}
          </div>
        </div>
        
        {/* Download button (for non-image files or when no preview is available) */}
        {attachment.url && (!isPreviewableImage || !attachment.url) && (
          <a 
            href={attachment.url} 
            download={attachment.name}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-muted rounded-full"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}; 