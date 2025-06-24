import { storage } from './storage';
import { sendEmail } from './emailService';

// Process pending emails
export async function processEmailQueue() {
  try {
    const pendingEmails = await storage.getPendingEmails();
    const now = new Date();
    
    for (const email of pendingEmails) {
      // Check if email should be sent now (either no scheduled time or time has passed)
      if (!email.scheduledFor || email.scheduledFor <= now) {
        try {
          const success = await sendEmail({
            to: email.to,
            from: 'noreply@hitchbuddy.com',
            subject: email.subject,
            html: email.content
          });
          
          if (success) {
            await storage.markEmailAsSent(email.id);
            console.log(`Email sent successfully to ${email.to}: ${email.subject}`);
          } else {
            await storage.markEmailAsFailed(email.id);
            console.log(`Failed to send email to ${email.to}: ${email.subject}`);
          }
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
          await storage.markEmailAsFailed(email.id);
        }
      }
    }
  } catch (error) {
    console.error('Error processing email queue:', error);
  }
}

// Start email processor that runs every 30 minutes to reduce server load
export function startEmailProcessor() {
  // Process immediately on start
  processEmailQueue();
  
  // Then process every 30 minutes (reduced frequency for production)
  setInterval(processEmailQueue, 30 * 60 * 1000);
  
  console.log('Email processor started - checking queue every 30 minutes');
}