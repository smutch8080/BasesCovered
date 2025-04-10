import { createAdminAccount } from '../src/lib/createAdmin';
import { createTestAccounts } from '../src/lib/createTestAccounts';

async function init() {
  try {
    // Create admin account first
    console.log('Creating admin account...');
    await createAdminAccount();
    
    // Create test accounts
    console.log('Creating test accounts...');
    await createTestAccounts();
    
    console.log('All accounts created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create accounts:', error);
    process.exit(1);
  }
}