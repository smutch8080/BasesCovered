import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MediaItem } from '../../types/media';
import { uploadMediaFile } from './storage';

export async function fetchPlayerMedia(playerId: string): Promise<MediaItem[]> {
  if (!playerId) {
    console.warn('No player ID provided for media fetch');
    return [];
  }

  try {
    const mediaRef = collection(db, 'player_media');
    const q = query(
      mediaRef,
      where('playerId', '==', playerId),
      where('privacy', 'in', ['public', 'friends'])
    );
    
    const snapshot = await getDocs(q);
    const media: MediaItem[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      media.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as MediaItem);
    });
    
    return media;
  } catch (error: any) {
    console.error('Error fetching player media:', error);
    if (error.code === 'permission-denied') {
      console.log('Permission denied accessing media, returning empty array');
      return [];
    }
    throw error;
  }
}

export async function addPlayerMedia(playerId: string, file: File, metadata: Partial<MediaItem>): Promise<MediaItem> {
  try {
    // Upload file to storage
    const url = await uploadMediaFile(file, playerId);

    // Create media document
    const mediaData = {
      playerId,
      url,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      privacy: 'public',
      featured: false,
      ...metadata,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'player_media'), mediaData);
    
    return {
      id: docRef.id,
      ...mediaData,
      createdAt: mediaData.createdAt.toDate(),
      updatedAt: mediaData.updatedAt.toDate()
    } as MediaItem;
  } catch (error) {
    console.error('Error adding player media:', error);
    throw error;
  }
}

export async function updatePlayerMedia(mediaId: string, updates: Partial<MediaItem>): Promise<void> {
  try {
    const mediaRef = doc(db, 'player_media', mediaId);
    await updateDoc(mediaRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating player media:', error);
    throw error;
  }
}

export async function deletePlayerMedia(mediaId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'player_media', mediaId));
  } catch (error) {
    console.error('Error deleting player media:', error);
    throw error;
  }
}