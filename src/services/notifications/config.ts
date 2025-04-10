// Configuration for both browser and Node environments
export const config = {
  sendgrid: {
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY,
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'notifications@coachpad.com'
  },
  twilio: {
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER
  }
};