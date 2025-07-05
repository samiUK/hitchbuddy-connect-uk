import { MailService } from '@sendgrid/mail';

// Email service for password reset functionality
class EmailService {
  private mailService: MailService;
  private isConfigured: boolean = false;

  constructor() {
    this.mailService = new MailService();
    this.configure();
  }

  private configure() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      this.mailService.setApiKey(apiKey);
      this.isConfigured = true;
    } else {
      console.warn('SendGrid API key not found. Email functionality will be disabled.');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.error('SendGrid not configured. Cannot send password reset email.');
      return false;
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'https://hitchbuddy-connect-uk.onrender.com'}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: email,
      from: 'noreply@hitchbuddy.com', // This should be verified with SendGrid
      subject: 'Reset Your HitchBuddy Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">HitchBuddy</h1>
            <p style="color: white; margin: 5px 0;">Share Your Journey, Save the Planet</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Hello ${userName},
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              We received a request to reset your HitchBuddy password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #3b82f6, #10b981); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2025 HitchBuddy. Connecting eco-conscious travelers worldwide.
            </p>
          </div>
        </div>
      `,
      text: `
        HitchBuddy - Password Reset Request
        
        Hello ${userName},
        
        We received a request to reset your HitchBuddy password. 
        Click the link below to create a new password:
        
        ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The HitchBuddy Team
      `
    };

    try {
      await this.mailService.send(msg);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();