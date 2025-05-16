import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CampaignType {
  EMAIL = 'email',
  SOCIAL_MEDIA = 'social_media',
  SMS = 'sms',
  PUSH_NOTIFICATION = 'push_notification',
  DISPLAY_AD = 'display_ad',
  SEARCH_AD = 'search_ad'
}

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: CampaignType })
  type: CampaignType;

  @Prop({ required: true, enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop({ type: [String], required: true })
  targetSegments: string[];

  @Prop({ type: Object, required: true })
  content: {
    subject?: string;
    body: string;
    mediaUrls?: string[];
    callToAction?: {
      text: string;
      url: string;
    };
  };

  @Prop({ type: Object, required: true })
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
    frequency?: {
      type: string;
      interval: number;
    };
  };

  @Prop({ type: Object })
  settings: {
    budget?: number;
    maxRecipients?: number;
    priority?: number;
    tags?: string[];
    customParameters?: Record<string, any>;
  };

  @Prop({ type: Object })
  performance: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    roi: number;
    lastUpdated: Date;
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);