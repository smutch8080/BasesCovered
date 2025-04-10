import sgMail from '@sendgrid/mail';
import { config } from '../../services/notifications/config';

if (config.sendgrid.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey);
}

export async function sendServerEmail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!config.sendgrid.apiKey) {
    console.warn('SendGrid API key not configured. Email not sent.');
    return;
  }

  try {
    await sgMail.send({
      to,
      from: config.sendgrid.fromEmail,
      subject,
      text,
      html: html || text
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}