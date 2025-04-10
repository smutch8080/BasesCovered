import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import drillsData from '../data/drills.json';

export async function importDrills() {
  try {
    const drillsRef = collection(db, 'drills');
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    console.log(`Starting import of ${drillsData.drills.length} drills...`);

    // Process drills sequentially with proper error handling
    for (const drill of drillsData.drills) {
      try {
        // Check if drill exists
        const existingQuery = query(drillsRef, where('name', '==', drill.name));
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
          console.log(`Skipping existing drill: ${drill.name}`);
          skippedCount++;
          continue;
        }

        // Add timestamps and initialize counters
        const drillDoc = {
          ...drill,
          votes: 0,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await addDoc(drillsRef, drillDoc);
        console.log(`Successfully imported: ${drill.name}`);
        successCount++;

        // Add a small delay between imports
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Failed to import drill ${drill.name}:`, error);
        errorCount++;
      }
    }

    console.log('\nImport Summary:');
    console.log(`Successfully imported: ${successCount} drills`);
    console.log(`Skipped (already exist): ${skippedCount} drills`);
    console.log(`Failed to import: ${errorCount} drills`);

  } catch (error) {
    console.error('Error during import process:', error);
    throw error;
  }
}