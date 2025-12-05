import nodemailer from 'nodemailer';

/**
 * Create a transporter from environment variables when available, otherwise
 * fall back to a console logger so local development does not fail if SMTP
 * credentials are missing.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !port || !user || !pass) {
    return {
      sendMail: async (options) => {
        console.info('✉️  Email (dev fallback):', {
          to: options.to,
          subject: options.subject,
          text: options.text,
        });
        return { messageId: 'dev-fallback' };
      },
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

const transporter = createTransporter();

export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject) {
    throw new Error('Email "to" and "subject" are required.');
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@csiet.local';

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
