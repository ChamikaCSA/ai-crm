import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  EMAIL = 'email',
  PHONE = 'phone',
  OTHER = 'other',
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
  @ApiProperty({ description: 'Company name' })
  @Prop({ required: true })
  companyName: string;

  @ApiProperty({ description: 'Contact person name' })
  @Prop({ required: true })
  contactName: string;

  @ApiProperty({ description: 'Contact email' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ description: 'Contact phone number' })
  @Prop()
  phone: string;

  @ApiProperty({ description: 'Lead status', enum: LeadStatus })
  @Prop({ type: String, enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @ApiProperty({ description: 'Lead source', enum: LeadSource })
  @Prop({ type: String, enum: LeadSource, required: true })
  source: LeadSource;

  @ApiProperty({ description: 'Estimated deal value' })
  @Prop({ type: Number, default: 0 })
  value: number;

  @ApiProperty({ description: 'Notes about the lead' })
  @Prop()
  notes: string;

  @ApiProperty({ description: 'Assigned sales representative ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedTo: string;

  @ApiProperty({ description: 'Last contact date' })
  @Prop({ type: Date, default: Date.now })
  lastContact: Date;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

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
}

export const LeadSchema = SchemaFactory.createForClass(Lead);