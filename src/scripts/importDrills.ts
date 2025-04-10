import { importDrills } from '../lib/importDrills';

async function init() {
  try {
    console.log('Starting drill import process...');
    await importDrills();
    console.log('Import process completed');
    
    // Give time for any pending operations to complete
    setTimeout(() => {
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.error('Failed to import drills:', error);
    process.exit(1);
  }
}

init();