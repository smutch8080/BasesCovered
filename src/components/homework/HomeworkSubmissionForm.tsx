import React, { useState } from 'react';
import { FileText, Upload, Trash2 } from 'lucide-react';
import { HomeworkAttachment } from '../../types/homework';
import toast from 'react-hot-toast';

interface Props {
  onSubmit: (data: {
    comment: string;
    attachments: HomeworkAttachment[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export const HomeworkSubmissionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<HomeworkAttachment[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit({
        comment: comment.trim(),
        attachments
      });
      
      // Reset form
      setComment('');
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting homework:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      // TODO: Implement file upload to storage
      // For now, just create mock attachments
      const newAttachments: HomeworkAttachment[] = Array.from(files).map(file => ({
        id: Math.random().toString(),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type === 'application/pdf' ? 'pdf' : 'video',
        url: URL.createObjectURL(file),
        name: file.name,
        createdAt: new Date()
      }));

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Add any comments about your homework completion..."
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Attachments
          </label>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              onChange={handleFileUpload}
              multiple
              accept="image/*,video/*,.pdf"
              className="hidden"
            />
          </label>
        </div>

        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{attachment.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No attachments added yet
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Homework'}
        </button>
      </div>
    </form>
  );
};