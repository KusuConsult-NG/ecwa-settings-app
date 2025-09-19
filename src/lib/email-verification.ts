// Email Verification System

import { generateVerificationCode, getVerificationExpiry } from './organization';

export interface EmailVerification {
  id: string;
  email: string;
  code: string;
  type: 'leader_verification' | 'password_reset' | 'account_activation';
  organizationId?: string;
  leaderId?: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Generate verification code and expiry
export function createVerificationData(): { code: string; expiresAt: string } {
  return {
    code: generateVerificationCode(),
    expiresAt: getVerificationExpiry()
  };
}

// Email templates for different verification types
export function getEmailTemplate(
  type: EmailVerification['type'],
  data: {
    leaderName?: string;
    organizationName?: string;
    code: string;
    position?: string;
  }
): EmailTemplate {
  const { leaderName, organizationName, code, position } = data;

  switch (type) {
    case 'leader_verification':
      return {
        subject: `ECWA Organization - Leader Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">ECWA Organization System</h2>
            <p>Dear ${leaderName || 'Leader'},</p>
            <p>You have been added as a ${position || 'leader'} in ${organizationName || 'ECWA Organization'}.</p>
            <p>To access your dashboard and complete your profile setup, please use the verification code below:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
            </div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code expires in 30 minutes</li>
              <li>Use your email address and this code to log in</li>
              <li>You will be prompted to set up your password on first login</li>
            </ul>
            <p>If you did not expect this email, please contact the organization administrator.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from the ECWA Organization Management System.
            </p>
          </div>
        `,
        text: `
ECWA Organization System

Dear ${leaderName || 'Leader'},

You have been added as a ${position || 'leader'} in ${organizationName || 'ECWA Organization'}.

To access your dashboard and complete your profile setup, please use the verification code below:

VERIFICATION CODE: ${code}

Important:
- This code expires in 30 minutes
- Use your email address and this code to log in
- You will be prompted to set up your password on first login

If you did not expect this email, please contact the organization administrator.

This is an automated message from the ECWA Organization Management System.
        `
      };

    case 'password_reset':
      return {
        subject: `ECWA Organization - Password Reset Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">ECWA Organization System</h2>
            <p>Dear ${leaderName || 'User'},</p>
            <p>You have requested to reset your password for ${organizationName || 'ECWA Organization'}.</p>
            <p>Please use the verification code below to reset your password:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
            </div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code expires in 30 minutes</li>
              <li>Use this code to reset your password</li>
              <li>If you did not request this, please ignore this email</li>
            </ul>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from the ECWA Organization Management System.
            </p>
          </div>
        `,
        text: `
ECWA Organization System

Dear ${leaderName || 'User'},

You have requested to reset your password for ${organizationName || 'ECWA Organization'}.

Please use the verification code below to reset your password:

VERIFICATION CODE: ${code}

Important:
- This code expires in 30 minutes
- Use this code to reset your password
- If you did not request this, please ignore this email

This is an automated message from the ECWA Organization Management System.
        `
      };

    case 'account_activation':
      return {
        subject: `ECWA Organization - Account Activation Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">ECWA Organization System</h2>
            <p>Dear ${leaderName || 'User'},</p>
            <p>Welcome to ${organizationName || 'ECWA Organization'}!</p>
            <p>Please use the verification code below to activate your account:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
            </div>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Use this code to activate your account</li>
              <li>Set up your password</li>
              <li>Complete your profile</li>
              <li>Access your dashboard</li>
            </ul>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from the ECWA Organization Management System.
            </p>
          </div>
        `,
        text: `
ECWA Organization System

Dear ${leaderName || 'User'},

Welcome to ${organizationName || 'ECWA Organization'}!

Please use the verification code below to activate your account:

VERIFICATION CODE: ${code}

Next Steps:
- Use this code to activate your account
- Set up your password
- Complete your profile
- Access your dashboard

This is an automated message from the ECWA Organization Management System.
        `
      };

    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

// Mock email sending function (replace with actual email service)
export async function sendVerificationEmail(
  email: string,
  template: EmailTemplate
): Promise<boolean> {
  try {
    // In a real implementation, this would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    // - Mailgun
    
    console.log('📧 Sending verification email to:', email);
    console.log('📧 Subject:', template.subject);
    console.log('📧 Code:', template.text.match(/VERIFICATION CODE: (\d+)/)?.[1] || 'N/A');
    
    // For development, we'll just log the email
    // In production, implement actual email sending here
    
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Validate verification code
export function validateVerificationCode(
  code: string,
  verification: EmailVerification
): { valid: boolean; error?: string } {
  if (verification.isUsed) {
    return { valid: false, error: 'Verification code has already been used' };
  }

  if (new Date() > new Date(verification.expiresAt)) {
    return { valid: false, error: 'Verification code has expired' };
  }

  if (verification.code !== code) {
    return { valid: false, error: 'Invalid verification code' };
  }

  return { valid: true };
}
