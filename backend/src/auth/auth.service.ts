import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../users/user.schema';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { AuditLog, AuditAction } from '../audit/audit.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('AuditLog') private auditLogModel: Model<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any, ipAddress: string, userAgent: string) {
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

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled,
      },
    };
  }

  async generateMfaSecret(userId: string) {
    const secret = speakeasy.generateSecret();
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.mfaSecret = secret.base32;
    await user.save();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.email,
      issuer: 'AI CRM',
    });

    const qrCode = await qrcode.toDataURL(otpauthUrl);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyMfaToken(userId: string, token: string) {
    const user = await this.userModel.findById(userId);

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not set up');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.CUSTOMER, // Default role
      isMfaEnabled: false,
    });

    // Create audit log
    const auditLog = await this.auditLogModel.create({
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
}