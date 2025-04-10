import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCE_7cUXA9NYAr8tc0Jgs2KoX2cYbEISsg",
  authDomain: "softball-practice-planner.firebaseapp.com",
  projectId: "softball-practice-planner",
  storageBucket: "softball-practice-planner.firebasestorage.app",
  messagingSenderId: "182231500377",
  appId: "1:182231500377:web:0bd50635799a23dc0c1348"
};

async function deployRules() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development') {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }

    // Read rules file
    const rulesPath = resolve(process.cwd(), 'firestore.rules');
    const rules = readFileSync(rulesPath, 'utf-8');

    console.log('Rules loaded successfully:', rules.slice(0, 100) + '...');
    console.log('Rules would be deployed to Firebase project:', firebaseConfig.projectId);
    
    // Note: Actual deployment requires Firebase CLI which isn't available in WebContainer
    console.log('\nNOTE: Rules deployment in WebContainer is simulated.');
    console.log('To deploy rules in production:');
    console.log('1. Install Firebase CLI locally');
    console.log('2. Run: firebase deploy --only firestore:rules');

    process.exit(0);
  } catch (error) {
    console.error('Error deploying rules:', error);
    process.exit(1);
  }
}

deployRules();