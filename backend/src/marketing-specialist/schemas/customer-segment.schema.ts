import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SegmentType {
  DEMOGRAPHIC = 'demographic',
  BEHAVIORAL = 'behavioral',
  GEOGRAPHIC = 'geographic',
  PSYCHOGRAPHIC = 'psychographic',
  CUSTOM = 'custom'
}

@Schema({ timestamps: true })
export class CustomerSegment extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: SegmentType })
  type: SegmentType;

  @Prop({ type: [String], required: true })
  customerIds: string[];

  @Prop({ type: Object, required: true })
  criteria: {
    demographics: {
      ageRange?: [number, number];
      gender?: string[];
      location?: string[];
      incomeRange?: [number, number];
    };
    behavior: {
      purchaseHistory?: string[];
      websiteActivity?: string[];
      engagementLevel?: string;
      lastInteractionDate?: Date;
    };
    preferences: {
      interests?: string[];
      preferredChannels?: string[];
      productCategories?: string[];
    };
  };

  @Prop({ type: Object })
  aiInsights: {
    segmentSize: number;
    averageLifetimeValue: number;
    churnRisk: number;
    engagementScore: number;
    recommendedActions: string[];
    lastUpdated: Date;
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CustomerSegmentSchema = SchemaFactory.createForClass(CustomerSegment);