import twilio from 'twilio';
import { config } from '../../services/notifications/config';

let twilioClient: twilio.Twilio | null = null;

if (config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
}

export async function sendServerSMS({ to, text }: {
  to: string;
  text: string;
}) {
  if (!twilioClient || !config.twilio.phoneNumber) {
    console.warn('Twilio not configured. SMS not sent.');
    return;
  }

  try {
    await twilioClient.messages.create({
      body: text,
      to,
      from: config.twilio.phoneNumber
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}