import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';

async function deployRules() {
  try {
    // Read rules file
    const rulesPath = resolve(process.cwd(), 'firestore.rules');
    const rules = readFileSync(rulesPath, 'utf-8');

    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });

    // Deploy rules
    console.log('Deploying Firestore rules...');
    const rulesService = getSecurityRules(app);
    
    await rulesService.releaseSecurityRules({
      name: `projects/${process.env.FIREBASE_PROJECT_ID}/rulesets/firestore.rules`,
      rules: rules
    });

    console.log('Rules deployed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deploying rules:', error);
    process.exit(1);
  }
}

deployRules();