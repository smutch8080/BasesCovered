// Browser-safe SMS service
export async function sendSMS({ to, text }: {
  to: string;
  text: string;
}) {
  // In browser environment, we'll need to call our backend API
  // For now, just log the attempt
  console.log('SMS would be sent:', { to, text });
  
  // In production, you would make an API call to your backend:
  // return fetch('/api/notifications/sms', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, text })
  // });
}