import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types/auth';

export const createAdminAccount = async () => {
  try {
    const email = 'admin@softballplanner.com';
    const password = 'admin123!@#';
    
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const adminData: User = {
      id: user.uid,
      email,
      displayName: 'System Administrator',
      role: 'admin',
      leagues: [],
      teams: []
    };
    
    await setDoc(doc(db, 'users', user.uid), adminData);
    
    console.log('Admin account created successfully');
    return { email, password };
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};