import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../lib/firebase';
import { MediaItem } from '../../types/media';

const storage = getStorage();

export async function uploadMediaFile(file: File, playerId: string): Promise<string> {
  if (!playerId) {
    throw new Error('Player ID is required for media upload');
  }

  try {
    console.log('Starting file upload for player:', playerId);
    
    // Create unique filename with proper path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2);
    const extension = file.name.split('.').pop()?.toLowerCase();
    const filename = `${timestamp}-${randomId}.${extension}`;
    const path = `player_media/${playerId}/${filename}`;
    
    console.log('Uploading file to path:', path);
    const storageRef = ref(storage, path);

    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        playerId,
        originalName: file.name
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('File uploaded successfully:', snapshot.metadata);

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    console.log('File available at:', url);

    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed');
  }
}