import { loadEnv } from '../utils/env';
import { sendServerEmail } from './notifications/email';
import { sendServerSMS } from './notifications/sms';
import { emailTemplates, smsTemplates } from '../services/notifications/templates';

// Load environment variables for Node.js script
const env = loadEnv();
Object.entries(env).forEach(([key, value]) => {
  process.env[key] = value;
});

async function testNotifications() {
  try {
    console.log('Starting notification tests...');

    // Test email notification
    console.log('\nTesting email notification...');
    try {
      const emailData = emailTemplates.practiceReminder({
        playerName: 'Test Player',
        practiceName: 'Weekly Practice',
        date: '2024-03-15',
        time: '4:00 PM',
        location: '123 Sports Field'
      });

      await sendServerEmail({
        to: 'test@example.com',
        ...emailData
      });
      console.log('✓ Email test completed successfully');
    } catch (error) {
      console.error('× Email test failed:', error);
    }

    // Test SMS notification
    console.log('\nTesting SMS notification...');
    try {
      const smsData = smsTemplates.practiceReminder({
        practiceName: 'Weekly Practice',
        date: '2024-03-15',
        time: '4:00 PM'
      });

      await sendServerSMS({
        to: '+1234567890',
        text: smsData
      });
      console.log('✓ SMS test completed successfully');
    } catch (error) {
      console.error('× SMS test failed:', error);
    }

    console.log('\nNotification tests completed');
  } catch (error) {
    console.error('\nError running tests:', error);
  }
}

testNotifications();