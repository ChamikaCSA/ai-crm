import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { APP_NAME } from '../../config/strings';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to ${APP_NAME}!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM_EMAIL'),
        to: email,
        subject: 'Reset your password',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        `,
      });
    } catch (error) {
      throw error;
    }
  }

  async sendProfileUpdateNotification(email: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: email,
      subject: 'Profile Updated',
      html: `
        <h1>Profile Update Notification</h1>
        <p>Your profile has been successfully updated.</p>
        <p>If you didn't make these changes, please contact support immediately.</p>
      `,
    });
  }
}