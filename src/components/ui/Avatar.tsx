import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Determine size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };
  
  // Generate a consistent background color based on the name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-pink-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-blue-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-orange-500'
    ];
    
    // Simple hash function to get a consistent index
    const hash = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  if (src) {
    // If we have an image URL, render the image
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}
      >
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, fallback to initials
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add(getColorFromName(name));
            e.currentTarget.parentElement!.innerHTML = getInitials(name);
          }}
        />
      </div>
    );
  }
  
  // Otherwise, render initials with a background color
  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${getColorFromName(name)} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-medium
        flex-shrink-0
        ${className}
      `}
      title={name}
    >
      {name ? getInitials(name) : <User className="w-4 h-4" />}
    </div>
  );
} 