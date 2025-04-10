import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Chant } from '../../types/chants';

export async function getFeaturedChant(): Promise<Chant | null> {
  try {
    const now = new Date();
    const chantsRef = collection(db, 'chants');
    const q = query(
      chantsRef,
      where('isApproved', '==', true),
      where('featuredUntil', '>=', now),
      orderBy('featuredUntil', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // If no featured chant, get highest rated approved chant
      const fallbackQuery = query(
        chantsRef,
        where('isApproved', '==', true),
        orderBy('avgRating', 'desc'),
        limit(1)
      );
      const fallbackSnapshot = await getDocs(fallbackQuery);
      if (fallbackSnapshot.empty) return null;
      
      const data = fallbackSnapshot.docs[0].data();
      return {
        ...data,
        id: fallbackSnapshot.docs[0].id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        featuredUntil: data.featuredUntil?.toDate()
      } as Chant;
    }
    
    const data = snapshot.docs[0].data();
    return {
      ...data,
      id: snapshot.docs[0].id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      featuredUntil: data.featuredUntil?.toDate()
    } as Chant;
  } catch (error) {
    console.error('Error getting featured chant:', error);
    return null;
  }
}