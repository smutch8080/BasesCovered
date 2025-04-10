import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AwardCategory } from '../../types';

interface SampleAward {
  teamId: string;
  playerId: string;
  playerName: string;
  category: AwardCategory;
  type: string;
  date: Date;
}

export async function setupTeamAwards(sampleAwards: SampleAward[]) {
  try {
    const batch = writeBatch(db);
    const awardsRef = collection(db, 'team_awards');

    console.log('Starting awards setup...');
    
    for (const award of sampleAwards) {
      const docRef = doc(awardsRef);
      batch.set(docRef, {
        ...award,
        date: award.date,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log('Team awards setup completed successfully');
  } catch (error) {
    console.error('Error setting up team awards:', error);
    throw error;
  }
}