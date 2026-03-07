const { Resend } = require('resend');
const logger = require('../utils/logger');

const FEEDBACK_TO_EMAIL = process.env.FEEDBACK_TO_EMAIL || 'pranaav.iyer@gmail.com';
const RESEND_FROM = process.env.RESEND_FROM || 'Centra <onboarding@resend.dev>';

/**
 * Send account-deletion feedback to the configured email via Resend.
 * Requires RESEND_API_KEY in .env. If not set, logs the feedback only.
 */
async function sendFeedbackEmail({ reason, message, userEmail }) {
  const apiKey = process.env.RESEND_API_KEY;
  const text = [
    'Account deletion feedback',
    '---',
    `Reason: ${reason || '(not provided)'}`,
    `User email: ${userEmail || '(unknown)'}`,
    '',
    'Additional feedback:',
    message ? message : '(none)',
  ].join('\n');

  if (!apiKey || !apiKey.trim()) {
    logger.info('Feedback (RESEND_API_KEY not set, logged only)', { reason, userEmail, messagePreview: (message || '').slice(0, 80) });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [FEEDBACK_TO_EMAIL],
      subject: `[Centra] Account deletion feedback from ${userEmail || 'unknown'}`,
      text,
    });
    if (error) {
      logger.error('Resend feedback email failed', { error: error.message, userEmail });
      throw new Error(error.message);
    }
    logger.info('Feedback email sent via Resend', { to: FEEDBACK_TO_EMAIL, userEmail, id: data?.id });
  } catch (err) {
    logger.error('Failed to send feedback email', { error: err.message, userEmail });
    throw err;
  }
}

module.exports = { sendFeedbackEmail, FEEDBACK_TO_EMAIL };
