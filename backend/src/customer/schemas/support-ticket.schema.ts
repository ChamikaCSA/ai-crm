import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupportTicketDocument = SupportTicket & Document;

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SupportTicketCategory {
  GENERAL = 'GENERAL',
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  FEATURE = 'FEATURE',
}

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: SupportTicketStatus, default: SupportTicketStatus.OPEN })
  status: SupportTicketStatus;

  @Prop({ type: String, enum: SupportTicketPriority, default: SupportTicketPriority.MEDIUM })
  priority: SupportTicketPriority;

  @Prop({ type: String, enum: SupportTicketCategory, default: SupportTicketCategory.GENERAL })
  category: SupportTicketCategory;

  @Prop({ type: [{ name: String, url: String }], default: [] })
  attachments: Array<{ name: string; url: string }>;

  @Prop({ type: [{
    author: String,
    message: String,
    timestamp: Date,
    attachments: [{ name: String, url: String }]
  }], default: [] })
  replies: Array<{
    author: string;
    message: string;
    timestamp: Date;
    attachments: Array<{ name: string; url: string }>;
  }>;

  @Prop()
  resolution?: string;

  @Prop()
  assignedTo?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);