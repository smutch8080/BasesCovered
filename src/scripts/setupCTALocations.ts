import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CTALocation } from '../types/cta';

const defaultLocations: Omit<CTALocation, 'id'>[] = [
  {
    name: 'Dashboard',
    description: 'Main dashboard CTA area',
    placement: 'dashboard'
  },
  {
    name: 'Teams',
    description: 'Teams page CTA area',
    placement: 'teams'
  },
  {
    name: 'Events',
    description: 'Events page CTA area',
    placement: 'events'
  }
];

async function setupCTALocations() {
  try {
    console.log('Starting CTA locations setup...');
    const locationsRef = collection(db, 'cta_locations');

    for (const location of defaultLocations) {
      // Check if location already exists
      const q = query(
        locationsRef,
        where('placement', '==', location.placement)
      );
      const existingDocs = await getDocs(q);

      if (existingDocs.empty) {
        await addDoc(locationsRef, location);
        console.log(`Created location: ${location.name}`);
      } else {
        console.log(`Location ${location.name} already exists`);
      }
    }

    console.log('CTA locations setup completed successfully');
  } catch (error) {
    console.error('Error setting up CTA locations:', error);
    throw error;
  }
}

setupCTALocations();