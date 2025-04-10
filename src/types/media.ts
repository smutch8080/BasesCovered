export interface MediaItem {
  id: string;
  playerId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  privacy: 'public' | 'private' | 'friends';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}