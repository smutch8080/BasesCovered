import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../contexts/AuthContext';

export const getUserData = async (uid: string): Promise<User> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('User document not found');
  }
  return { uid, ...userDoc.data() as Omit<User, 'uid'> };
}; 