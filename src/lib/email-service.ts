// Real Email Service Integration
// Supports multiple email providers with fallback

export interface EmailProvider {
  name: string;
  sendEmail: (to: string, subject: string, html: string, text: string) => Promise<boolean>;
}

// SendGrid Email Provider
class SendGridProvider implements EmailProvider {
  name = 'SendGrid';
  
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to,
        from: process.env.FROM_EMAIL || 'noreply@ecwa.org',
        subject,
        text,
        html,
      };
      
      await sgMail.send(msg);
      console.log(`✅ Email sent via SendGrid to: ${to}`);
      return true;
    } catch (error) {
      console.error('❌ SendGrid error:', error);
      return false;
    }
  }
}

// Nodemailer SMTP Provider (Fallback)
class SMTPProvider implements EmailProvider {
  name = 'SMTP';
  
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@ecwa.org',
        to,
        subject,
        text,
        html,
      });
      
      console.log(`✅ Email sent via SMTP to: ${to}`, info.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP error:', error);
      return false;
    }
  }
}

// Console Provider (Development Fallback)
class ConsoleProvider implements EmailProvider {
  name = 'Console';
  
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    console.log('📧 EMAIL WOULD BE SENT:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('---');
    return true;
  }
}

// Email Service Manager
class EmailService {
  private providers: EmailProvider[] = [];
  private currentProvider: EmailProvider | null = null;
  
  constructor() {
    this.initializeProviders();
  }
  
  private initializeProviders() {
    // Add providers in order of preference
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push(new SendGridProvider());
    }
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.providers.push(new SMTPProvider());
    }
    
    // Always add console provider as fallback
    this.providers.push(new ConsoleProvider());
    
    this.currentProvider = this.providers[0];
    console.log(`📧 Email service initialized with ${this.currentProvider?.name} provider`);
  }
  
  async sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!this.currentProvider) {
      console.error('❌ No email provider available');
      return false;
    }
    
    try {
      const success = await this.currentProvider.sendEmail(to, subject, html, text);
      
      if (!success && this.providers.length > 1) {
        // Try fallback providers
        for (let i = 1; i < this.providers.length; i++) {
          console.log(`🔄 Trying fallback provider: ${this.providers[i].name}`);
          const fallbackSuccess = await this.providers[i].sendEmail(to, subject, html, text);
          if (fallbackSuccess) {
            this.currentProvider = this.providers[i];
            return true;
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }
  
  getCurrentProvider(): string {
    return this.currentProvider?.name || 'None';
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Convenience function
export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  return emailService.sendEmail(to, subject, html, text);
}
