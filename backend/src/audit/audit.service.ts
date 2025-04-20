import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './audit.schema';

@Injectable()
export class AuditService {
  constructor(@InjectModel('AuditLog') private auditLogModel: Model<AuditLog>) {}

  async log(
    userId: string,
    userEmail: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuditLog> {
    const auditLog = new this.auditLogModel({
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    });
    return auditLog.save();
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    return this.auditLogModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .exec();
  }
}