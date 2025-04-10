import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface MessageEditFormProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export const MessageEditForm: React.FC<MessageEditFormProps> = ({
  initialContent,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at the end of the text
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
      
      // Auto-resize the textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Handle content change and auto-resize
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim() === '') return;
    
    onSave(content);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
    
    // Cancel on Escape
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-1">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-400 dark:border-blue-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Edit your message..."
        rows={1}
      />
      
      <div className="flex justify-end mt-2 space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
        
        <button
          type="submit"
          className="p-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
          title="Save changes"
          disabled={content.trim() === '' || content === initialContent}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        Press Esc to cancel, Ctrl+Enter to save
      </div>
    </form>
  );
}; 