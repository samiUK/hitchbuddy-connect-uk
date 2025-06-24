import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email notifications will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would be sent to:', params.to, 'Subject:', params.subject);
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from || 'noreply@hitchbuddy.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function generateTripConfirmationEmail(
  recipientName: string,
  isDriver: boolean,
  tripDetails: {
    jobId: string;
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    otherPersonName: string;
    phoneNumber: string;
  }
): { subject: string; html: string; text: string } {
  const subject = `Trip Confirmed - Job #${tripDetails.jobId}`;
  
  const role = isDriver ? 'driver' : 'rider';
  const otherRole = isDriver ? 'rider' : 'driver';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Trip Confirmed!</h2>
      
      <p>Hi ${recipientName},</p>
      
      <p>Great news! Your trip has been confirmed. Here are the details:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Trip Details</h3>
        <p><strong>Job ID:</strong> ${tripDetails.jobId}</p>
        <p><strong>From:</strong> ${tripDetails.fromLocation}</p>
        <p><strong>To:</strong> ${tripDetails.toLocation}</p>
        <p><strong>Date:</strong> ${tripDetails.departureDate}</p>
        <p><strong>Time:</strong> ${tripDetails.departureTime}</p>
        <p><strong>Your ${otherRole}:</strong> ${tripDetails.otherPersonName}</p>
        <p><strong>Contact:</strong> ${tripDetails.phoneNumber}</p>
      </div>
      
      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0;">Next Steps:</h4>
        <ul>
          ${isDriver ? `
            <li>Contact your rider to confirm pickup details</li>
            <li>Ensure your vehicle is clean and ready</li>
            <li>Arrive at the pickup location on time</li>
          ` : `
            <li>Wait for your driver to contact you</li>
            <li>Be ready at the pickup location on time</li>
            <li>Have your phone charged for communication</li>
          `}
        </ul>
      </div>
      
      <p>If you need to make any changes or contact your ${otherRole}, please use the Hitchbuddy app.</p>
      
      <p>Safe travels!<br>The Hitchbuddy Team</p>
    </div>
  `;
  
  const text = `
Trip Confirmed - Job #${tripDetails.jobId}

Hi ${recipientName},

Your trip has been confirmed!

Trip Details:
- Job ID: ${tripDetails.jobId}
- From: ${tripDetails.fromLocation}
- To: ${tripDetails.toLocation}
- Date: ${tripDetails.departureDate}
- Time: ${tripDetails.departureTime}
- Your ${otherRole}: ${tripDetails.otherPersonName}
- Contact: ${tripDetails.phoneNumber}

${isDriver ? 
  'Please contact your rider to confirm pickup details and ensure your vehicle is ready.' :
  'Your driver will contact you. Please be ready at the pickup location on time.'
}

Safe travels!
The Hitchbuddy Team
  `;
  
  return { subject, html, text };
}

export function generateRatingRequestEmail(
  recipientName: string,
  isDriver: boolean,
  tripDetails: {
    jobId: string;
    fromLocation: string;
    toLocation: string;
    otherPersonName: string;
  }
): { subject: string; html: string; text: string } {
  const subject = `Rate Your Recent Trip - Job #${tripDetails.jobId}`;
  
  const otherRole = isDriver ? 'rider' : 'driver';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">How was your trip?</h2>
      
      <p>Hi ${recipientName},</p>
      
      <p>We hope you had a great trip! Please take a moment to rate your experience with ${tripDetails.otherPersonName}.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Trip Details</h3>
        <p><strong>Job ID:</strong> ${tripDetails.jobId}</p>
        <p><strong>Route:</strong> ${tripDetails.fromLocation} → ${tripDetails.toLocation}</p>
        <p><strong>Your ${otherRole}:</strong> ${tripDetails.otherPersonName}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://your-app-url.com/rate?job=${tripDetails.jobId}" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Rate Your Trip
        </a>
      </div>
      
      <p>Your feedback helps us maintain a safe and reliable ride-sharing community.</p>
      
      <p>Thank you for using Hitchbuddy!<br>The Hitchbuddy Team</p>
    </div>
  `;
  
  const text = `
How was your trip? - Job #${tripDetails.jobId}

Hi ${recipientName},

Please rate your recent trip with ${tripDetails.otherPersonName}.

Trip: ${tripDetails.fromLocation} → ${tripDetails.toLocation}
Job ID: ${tripDetails.jobId}

Visit your Hitchbuddy app to leave a rating and review.

Thank you for using Hitchbuddy!
The Hitchbuddy Team
  `;
  
  return { subject, html, text };
}