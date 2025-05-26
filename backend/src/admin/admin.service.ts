import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditAction } from '../audit/schemas/audit.schema';
import { User } from '../user/schemas/user.schema';
import { PasswordService } from '../common/services/password.service';
import { SystemEvent } from '../audit/schemas/system-event.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(SystemEvent.name) private systemEventModel: Model<SystemEvent>,
    private readonly passwordService: PasswordService,
  ) {}

  async getSystemMetrics() {
    return {
      metrics: [
        {
          name: 'Security Alerts',
          value: 0,
          trend: 0,
          status: 'excellent'
        },
        {
          name: 'System Uptime',
          value: 100.0,
          trend: 0,
          status: 'excellent'
        },
        {
          name: 'API Response Time',
          value: 85,
          trend: -2,
          status: 'good'
        },
        {
          name: 'Database Health',
          value: 95,
          trend: 1,
          status: 'good'
        }
      ]
    };
  }

  async getAuditLogs(limit: number = 10) {
    return this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getSystemEvents() {
    return this.systemEventModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }

  async getUsers() {
    return this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserMetrics() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Current metrics
    const totalUsers = await this.userModel.countDocuments();
    const activeUsers = await this.userModel.countDocuments({ status: 'active' });
    const mfaEnabledUsers = await this.userModel.countDocuments({ isMfaEnabled: true });

    // Previous metrics (24 hours ago)
    const previousTotalUsers = await this.userModel.countDocuments({
      createdAt: { $lte: twentyFourHoursAgo }
    });
    const previousActiveUsers = await this.userModel.countDocuments({
      status: 'active',
      createdAt: { $lte: twentyFourHoursAgo }
    });
    const previousMfaEnabledUsers = await this.userModel.countDocuments({
      mfaEnabled: true,
      createdAt: { $lte: twentyFourHoursAgo }
    });

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const totalTrend = calculateTrend(totalUsers, previousTotalUsers);
    const activeTrend = calculateTrend(activeUsers, previousActiveUsers);
    const mfaTrend = calculateTrend(mfaEnabledUsers, previousMfaEnabledUsers);

    // Calculate security score based on MFA adoption and active users
    const securityScore = Math.round(
      ((mfaEnabledUsers / totalUsers) * 0.7 + (activeUsers / totalUsers) * 0.3) * 100
    );

    // Calculate previous security score
    const previousSecurityScore = Math.round(
      ((previousMfaEnabledUsers / previousTotalUsers) * 0.7 + (previousActiveUsers / previousTotalUsers) * 0.3) * 100
    );

    const securityScoreTrend = calculateTrend(securityScore, previousSecurityScore);

    return {
      metrics: [
        {
          name: 'Total Users',
          value: totalUsers,
          trend: Number(totalTrend.toFixed(1)),
          change: totalUsers - previousTotalUsers
        },
        {
          name: 'Active Users',
          value: activeUsers,
          trend: Number(activeTrend.toFixed(1)),
          change: activeUsers - previousActiveUsers
        },
        {
          name: 'MFA Enabled',
          value: mfaEnabledUsers,
          trend: Number(mfaTrend.toFixed(1)),
          change: mfaEnabledUsers - previousMfaEnabledUsers
        },
        {
          name: 'Security Score',
          value: securityScore,
          trend: Number(securityScoreTrend.toFixed(1)),
          change: securityScore - previousSecurityScore
        }
      ]
    };
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isMfaEnabled: boolean;
    password: string;
  }) {
    // Validate password complexity
    this.passwordService.validatePasswordComplexity(userData.password);

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(userData.password);

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      isActive: true,
      isEmailVerified: false,
      interactionHistory: [],
      preferences: [],
    });

    await newUser.save();

    // Create audit log for user creation
    await this.auditLogModel.create({
      userId: newUser._id,
      userEmail: userData.email,
      action: AuditAction.CREATE,
      entityType: 'user',
      entityId: newUser._id,
      newValue: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isMfaEnabled: userData.isMfaEnabled,
      },
    });

    // Return user without password
    const userWithoutPassword = await this.userModel
      .findById(newUser._id)
      .select('-password')
      .exec();

    return userWithoutPassword;
  }

  async updateUser(userId: string, userData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isMfaEnabled: boolean;
    isActive: boolean;
  }>) {
    try {
      const existingUser = await this.userModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, userData, { new: true })
        .select('-password');

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      // Create audit log for user update
      await this.auditLogModel.create({
        userId: updatedUser._id,
        userEmail: updatedUser.email,
        action: AuditAction.UPDATE,
        entityType: 'user',
        entityId: updatedUser._id,
        oldValue: {
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          role: existingUser.role,
          isMfaEnabled: existingUser.isMfaEnabled,
          isActive: existingUser.isActive,
        },
        newValue: {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isMfaEnabled: updatedUser.isMfaEnabled,
          isActive: updatedUser.isActive,
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await this.userModel.findByIdAndDelete(userId);

    // Create audit log for user deletion
    await this.auditLogModel.create({
      userId: user._id,
      userEmail: user.email,
      action: AuditAction.DELETE,
      entityType: 'user',
      entityId: user._id,
      oldValue: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled,
        isActive: user.isActive,
      },
    });

    return { message: 'User deleted successfully' };
  }

  async getDashboardOverview() {
    try {
      const [
        userMetrics,
        systemMetrics,
        recentLogs,
        recentEvents,
        securityMetrics
      ] = await Promise.all([
        this.getUserMetrics(),
        this.getSystemMetrics(),
        this.getAuditLogs(5),
        this.getSystemEvents(),
        this.getSecurityMetrics()
      ]);

      return {
        userMetrics: userMetrics.metrics || [],
        systemMetrics: systemMetrics.metrics || [],
        recentLogs: recentLogs || [],
        recentEvents: recentEvents || [],
        securityMetrics: securityMetrics.metrics || []
      };
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      throw error;
    }
  }

  async getSecurityMetrics() {
    const totalUsers = await this.userModel.countDocuments();
    const mfaEnabledUsers = await this.userModel.countDocuments({ mfaEnabled: true });
    const activeUsers = await this.userModel.countDocuments({ status: 'active' });
    const failedLogins = await this.auditLogModel.countDocuments({
      action: 'LOGIN_FAILED',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      metrics: [
        {
          name: 'Security Score',
          value: Math.round((mfaEnabledUsers / totalUsers) * 100),
          trend: 5.2,
          status: 'good'
        },
        {
          name: 'Failed Logins (24h)',
          value: failedLogins,
          trend: -2.1,
          status: failedLogins > 10 ? 'warning' : 'good'
        },
        {
          name: 'Active Users',
          value: activeUsers,
          trend: 3.1,
          status: 'good'
        },
        {
          name: 'MFA Adoption',
          value: Math.round((mfaEnabledUsers / totalUsers) * 100),
          trend: 7.2,
          status: 'good'
        }
      ]
    };
  }
}