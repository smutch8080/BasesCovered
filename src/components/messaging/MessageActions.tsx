import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash, Reply, Smile } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface MessageActionsProps {
  messageId: string;
  isCurrentUserMessage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
}

export function MessageActions({
  messageId,
  isCurrentUserMessage,
  onEdit,
  onDelete,
  onReact,
  onReply
}: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useOnClickOutside(menuRef, () => {
    setShowMenu(false);
    setShowDeleteConfirm(false);
  });
  
  // Common emoji reactions
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢'];
  
  return (
    <div className="relative" ref={menuRef}>
      {/* Action button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Message actions"
      >
        <MoreVertical size={16} />
      </button>
      
      {/* Action menu */}
      {showMenu && (
        <div className="absolute top-0 right-full mr-2 bg-background border border-border rounded-lg shadow-md z-10 w-36 py-1">
          {/* Reply action */}
          <button
            onClick={() => {
              onReply();
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-sm text-left flex items-center hover:bg-muted transition-colors"
          >
            <Reply size={14} className="mr-2" />
            Reply
          </button>
          
          {/* Quick reactions */}
          <div className="px-3 py-2 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1">Quick reactions</div>
            <div className="flex justify-between">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowMenu(false);
                  }}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Edit and delete actions (only for current user's messages) */}
          {isCurrentUserMessage && (
            <div className="border-t border-border">
              {/* Edit action */}
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-sm text-left flex items-center hover:bg-muted transition-colors"
              >
                <Edit size={14} className="mr-2" />
                Edit
              </button>
              
              {/* Delete action */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-3 py-2 text-sm text-left flex items-center text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash size={14} className="mr-2" />
                  Delete
                </button>
              ) : (
                <div className="px-3 py-2">
                  <div className="text-xs text-destructive mb-1">Are you sure?</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 