import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, Image, FileText, Mic, Video } from 'lucide-react';
import { FileUploadProgress } from './FileUploadProgress';
import { Message } from '../../services/messaging/types';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  preview?: string;
  error?: string;
}

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, attachments: File[], replyToMessageId?: string) => void;
  onTyping: () => void;
  replyToMessage: Message | null;
  onCancelReply: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSendMessage,
  onTyping,
  replyToMessage,
  onCancelReply,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus the textarea when the component mounts or when replying to a message
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyToMessage]);

  // Auto-resize the textarea as the user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle message change and notify about typing
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Notify about typing
    onTyping();
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles: UploadingFile[] = Array.from(files).map(file => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      return {
        id: fileId,
        file,
        progress: 0,
        preview
      };
    });
    
    setUploadingFiles(prev => [...prev, ...newFiles]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId: string) => {
    setUploadingFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      
      // Revoke object URL for the removed file if it has a preview
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      
      return updatedFiles;
    });
  };

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    const hasContent = trimmedMessage.length > 0;
    const hasFiles = uploadingFiles.length > 0;
    
    // Don't send if there's no content and no files
    if (!hasContent && !hasFiles) return;
    
    // Send the message
    onSendMessage(
      trimmedMessage,
      uploadingFiles.map(f => f.file),
      replyToMessage?.id
    );
    
    // Clear the input
    setMessage('');
    setUploadingFiles([]);
    
    // Clear the reply
    if (replyToMessage) {
      onCancelReply();
    }
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-border">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="mb-2 p-2 bg-muted/30 rounded-lg flex items-start">
          <div className="flex-1 text-sm">
            <div className="font-medium">
              Replying to {replyToMessage.senderName || 'message'}
            </div>
            <div className="text-muted-foreground truncate">
              {replyToMessage.content}
            </div>
          </div>
          <button 
            onClick={onCancelReply}
            className="p-1 text-muted-foreground hover:text-foreground rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* File upload previews */}
      {uploadingFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          {uploadingFiles.map(file => (
            <FileUploadProgress
              key={file.id}
              file={{
                id: file.id,
                name: file.file.name,
                type: file.file.type,
                size: file.file.size,
                progress: file.progress,
                preview: file.preview,
                error: file.error
              }}
              onCancel={() => handleRemoveFile(file.id)}
            />
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File attachment button */}
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            disabled={disabled}
          >
            <Paperclip size={20} />
          </button>
        </div>
        
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full p-3 pr-10 rounded-lg border border-border bg-background resize-none min-h-[44px] max-h-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled}
            rows={1}
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          className={`p-2 rounded-full ${
            message.trim() || uploadingFiles.length > 0
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground'
          }`}
          disabled={disabled || (!message.trim() && uploadingFiles.length === 0)}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}; 