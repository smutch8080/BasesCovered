const { execSync } = require('child_process');

function deployRules() {
  try {
    // Check if firebase-tools is installed globally
    try {
      execSync('firebase --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('Installing firebase-tools...');
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    }

    // Deploy Firestore rules
    console.log('Deploying Firestore rules...');
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    
    console.log('Rules deployed successfully!');
  } catch (error) {
    console.error('Error deploying rules:', error);
    process.exit(1);
  }
}

deployRules();