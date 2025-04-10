import React, { useState, useRef, useEffect } from 'react';
import { Smile, Plus } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

// Common emoji reactions
const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏'];

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Close emoji picker when clicking outside
  useOnClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

  // Handle adding a custom emoji
  const handleAddCustomEmoji = () => {
    if (customEmojiInput.trim()) {
      onAddReaction(customEmojiInput.trim());
      setCustomEmojiInput('');
      setShowEmojiPicker(false);
    }
  };

  // Handle keyboard events for custom emoji input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomEmoji();
    } else if (e.key === 'Escape') {
      setShowEmojiPicker(false);
    }
  };

  // Check if the current user has reacted with a specific emoji
  const hasUserReacted = (reaction: Reaction) => {
    return reaction.userIds.includes(currentUserId);
  };

  // Toggle a reaction (add or remove)
  const toggleReaction = (emoji: string, reaction?: Reaction) => {
    if (reaction && hasUserReacted(reaction)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  if (reactions.length === 0 && !showEmojiPicker) {
    return (
      <button
        onClick={() => setShowEmojiPicker(true)}
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
        aria-label="Add reaction"
      >
        <Smile className="w-4 h-4 mr-1" />
        React
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 mt-1">
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => toggleReaction(reaction.emoji, reaction)}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
              hasUserReacted(reaction)
                ? 'bg-primary/10 text-primary'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
            title={`${reaction.userIds.length} ${
              reaction.userIds.length === 1 ? 'person' : 'people'
            }`}
          >
            <span className="mr-1">{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        ))}
        
        {reactions.length > 0 && (
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted hover:bg-muted/80 text-foreground"
            aria-label="Add reaction"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full mb-2 p-2 bg-background border border-border rounded-lg shadow-lg z-10 w-64"
        >
          <div className="grid grid-cols-4 gap-2 mb-2">
            {COMMON_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji, reactions.find(r => r.emoji === emoji))}
                className="text-xl hover:bg-muted p-1 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
          
          <div className="flex mt-2">
            <input
              type="text"
              value={customEmojiInput}
              onChange={(e) => setCustomEmojiInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Custom emoji..."
              className="flex-1 px-2 py-1 text-sm border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={handleAddCustomEmoji}
              className="px-2 py-1 bg-primary text-primary-foreground text-sm rounded-r-md hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 