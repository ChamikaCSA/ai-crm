import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum LeadSource {
  WEBSITE = 'website',
  EMAIL = 'email',
  PHONE = 'phone',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  LINKEDIN = 'linkedin',
  TRADE_SHOW = 'trade_show',
  OTHER = 'other',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum PreferredContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  LINKEDIN = 'linkedin',
}

@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ required: true, enum: LeadSource })
  source: LeadSource;

  @Prop({ required: true, enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Prop()
  company: string;

  @Prop()
  jobTitle: string;

  @Prop()
  notes: string;

  @Prop({ type: Number, default: 0 })
  leadScore: number;

  @Prop({ type: Number, default: 0 })
  value: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Interaction' }] })
  interactions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object })
  preferences: {
    preferredContactMethod: PreferredContactMethod;
    preferredContactTime: string;
    interests: string[];
    budget: number;
    timeline: string;
    painPoints: string[];
    decisionMaker: boolean;
  };

  @Prop({ type: Object })
  purchaseHistory: {
    products: string[];
    totalValue: number;
    lastPurchaseDate: Date;
    averageOrderValue: number;
    purchaseFrequency: number;
    lifetimeValue: number;
  };

  @Prop({ type: Object })
  aiInsights: {
    engagementScore: number;
    conversionProbability: number;
    nextBestAction: string;
    riskFactors: string[];
    opportunityAreas: string[];
    lastScoredAt: Date;
  };

  @Prop({ type: [{ type: Object }] })
  channelHistory: {
    channel: LeadSource;
    timestamp: Date;
    interactionType: string;
    notes: string;
  }[];

  @Prop({ type: Object })
  demographics: {
    industry: string;
    companySize: string;
    location: string;
    annualRevenue: number;
    employeeCount: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);