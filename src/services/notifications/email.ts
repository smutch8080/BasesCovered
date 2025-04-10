// Browser-safe email service
export async function sendEmail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  // In browser environment, we'll need to call our backend API
  // For now, just log the attempt
  console.log('Email would be sent:', { to, subject, text, html });
  
  // In production, you would make an API call to your backend:
  // return fetch('/api/notifications/email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, subject, text, html })
  // });
}