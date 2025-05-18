import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordService } from '../common/services/password.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { EmailService } from '../common/services/email.service';
import { AuditLog, AuditAction } from '../audit/schemas/audit.schema';
import { Interaction } from '../customer/schemas/interaction.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('AuditLog') private auditLogModel: Model<AuditLog>,
    @InjectModel('Interaction') private interactionModel: Model<Interaction>,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.passwordService.validatePasswordComplexity(createUserDto.password);
    const hashedPassword = await this.passwordService.hashPassword(createUserDto.password);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      this.passwordService.validatePasswordComplexity(updateUserDto.password);
      updateUserDto.password = await this.passwordService.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return deletedUser;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    this.passwordService.validatePasswordComplexity(changePasswordDto.newPassword);
    const hashedNewPassword = await this.passwordService.hashPassword(changePasswordDto.newPassword);
    user.password = hashedNewPassword;
    await user.save();

    return this.findOne(id);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto, ipAddress: string, userAgent: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If updating email, require verification
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const emailVerificationToken = this.passwordService.generateResetToken();
      const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.email = updateProfileDto.email;
      user.isEmailVerified = false;
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationTokenExpires = emailVerificationTokenExpires;

      await this.emailService.sendEmailVerification(updateProfileDto.email, emailVerificationToken);
    }

    // Update other fields
    if (updateProfileDto.firstName) user.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName) user.lastName = updateProfileDto.lastName;

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

    return this.findOne(id);
  }

  // Account related methods
  async getAccountDetails(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');

    // Get additional account information
    const accountInfo = {
      user,
      recentInteractions: await this.getRecentInteractions(userId),
      accountStatus: await this.getAccountStatus(userId),
    };

    return accountInfo;
  }

  private async getRecentInteractions(userId: string) {
    const interactions = await this.interactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    return interactions.map(interaction => ({
      type: interaction.type,
      description: interaction.description,
      timestamp: interaction.createdAt.toISOString(),
      metadata: interaction.metadata
    }));
  }

  private async getAccountStatus(userId: string) {
    // Implementation for getting account status
    return {
      status: 'active',
      lastLogin: new Date(),
      subscriptionStatus: 'active',
    };
  }
}