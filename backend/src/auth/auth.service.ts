import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { AuditLog, AuditAction } from '../audit/schemas/audit.schema';
import { EmailService } from '../email/email.service';
import { PasswordService } from './password.service';
import { APP_NAME } from '../config/strings';

export interface UserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isMfaEnabled: boolean;
  mfaSecret?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('AuditLog') private auditLogModel: Model<AuditLog>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email before logging in');
      }
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any, ipAddress: string, userAgent: string) {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };

    // Create audit log
    await this.auditLogModel.create({
      userId: user._id,
      userEmail: user.email,
      action: AuditAction.LOGIN,
      entityType: 'user',
      entityId: user._id,
      ipAddress,
      userAgent,
    });

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userModel.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = { email: user.email, sub: user._id, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateMfaSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: APP_NAME,
      issuer: APP_NAME,
    });
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.mfaSecret = secret.base32;
    await user.save();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: APP_NAME,
      encoding: 'base32',
      digits: 6,
      step: 30,
    });

    const qrCode = await qrcode.toDataURL(otpauthUrl);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyMfaToken(userId: string, token: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.mfaSecret) {
      throw new UnauthorizedException('MFA not set up');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
      step: 30,
      digits: 6,
    });

    return verified;
  }

  async enableMfa(userId: string, token: string, ipAddress: string, userAgent: string) {
    const verified = await this.verifyMfaToken(userId, token);

    if (!verified) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const user = await this.userModel.findById(userId);
    user.isMfaEnabled = true;
    await user.save();

    // Create audit log
    await this.auditLogModel.create({
      userId,
      userEmail: user.email,
      action: AuditAction.MFA_ENABLE,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return { success: true };
  }

  async disableMfa(userId: string, ipAddress: string, userAgent: string) {
    const user = await this.userModel.findById(userId);
    user.isMfaEnabled = false;
    user.mfaSecret = null;
    await user.save();

    // Create audit log
    await this.auditLogModel.create({
      userId,
      userEmail: user.email,
      action: AuditAction.MFA_DISABLE,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return { success: true };
  }

  async register(email: string, password: string, firstName: string, lastName: string, ipAddress: string, userAgent: string) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate password complexity
    this.passwordService.validatePasswordComplexity(password);

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = this.passwordService.generateResetToken();
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.CUSTOMER,
      isMfaEnabled: false,
      emailVerificationToken,
      emailVerificationTokenExpires,
      isEmailVerified: false,
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, emailVerificationToken);

    // Create audit log
    await this.auditLogModel.create({
      userId: newUser._id,
      userEmail: newUser.email,
      action: AuditAction.REGISTER,
      entityType: 'user',
      entityId: newUser._id,
      ipAddress,
      userAgent,
    });

    const { password: _, ...result } = newUser.toObject();
    return result;
  }

  async verifyEmail(token: string): Promise<{ access_token: string; user: any }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() },
      isEmailVerified: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    // Create audit log
    await this.auditLogModel.create({
      userId: user._id,
      userEmail: user.email,
      action: AuditAction.EMAIL_VERIFICATION,
      entityType: 'user',
      entityId: user._id,
    });

    // Generate JWT token
    const payload = { email: user.email, sub: user._id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled,
      },
    };
  }

  async requestPasswordReset(email: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        // Don't reveal whether the email exists
        return;
      }

      const resetToken = this.passwordService.generateResetToken();

      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetTokenExpires = resetTokenExpires;
      await user.save();

      await this.emailService.sendPasswordResetEmail(email, resetToken);

      // Create audit log
      await this.auditLogModel.create({
        userId: user._id,
        userEmail: user.email,
        action: AuditAction.PASSWORD_RESET_REQUEST,
        entityType: 'user',
        entityId: user._id,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string, ipAddress: string, userAgent: string): Promise<void> {
    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate password complexity
    this.passwordService.validatePasswordComplexity(newPassword);

    // Hash new password
    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // Create audit log
    await this.auditLogModel.create({
      userId: user._id,
      userEmail: user.email,
      action: AuditAction.PASSWORD_RESET,
      entityType: 'user',
      entityId: user._id,
      ipAddress,
      userAgent,
    });
  }

  async updateProfile(userId: string, updateData: any, ipAddress: string, userAgent: string): Promise<UserResponse> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // If updating email, require verification
    if (updateData.email && updateData.email !== user.email) {
      const emailVerificationToken = this.passwordService.generateResetToken();
      const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.email = updateData.email;
      user.isEmailVerified = false;
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationTokenExpires = emailVerificationTokenExpires;

      await this.emailService.sendEmailVerification(updateData.email, emailVerificationToken);
    }

    // If updating password
    if (updateData.password) {
      this.passwordService.validatePasswordComplexity(updateData.password);
      user.password = await this.passwordService.hashPassword(updateData.password);
    }

    // Update other fields
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;

    await user.save();

    // Send notification
    await this.emailService.sendProfileUpdateNotification(user.email);

    // Create audit log
    await this.auditLogModel.create({
      userId: user._id,
      userEmail: user.email,
      action: AuditAction.PROFILE_UPDATE,
      entityType: 'user',
      entityId: user._id,
      ipAddress,
      userAgent,
    });

    const { password: _, ...result } = user.toObject();
    return result as unknown as UserResponse;
  }

  async logout(userId: string, ipAddress: string, userAgent: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Create audit log for logout
    await this.auditLogModel.create({
      userId,
      userEmail: user.email,
      action: AuditAction.LOGOUT,
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return { success: true };
  }
}