import { createTestAccounts } from '../src/lib/createTestAccounts';

async function init() {
  try {
    const accounts = await createTestAccounts();
    console.log('Test accounts created successfully:', accounts);
  } catch (error) {
    console.error('Failed to create test accounts:', error);
    process.exit(1);
  }
}

init();