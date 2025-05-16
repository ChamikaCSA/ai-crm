import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CampaignType } from './campaign.schema';

@Schema({ timestamps: true })
export class CampaignAnalytics extends Document {
  @Prop({ required: true })
  campaignId: string;

  @Prop({ required: true, enum: CampaignType })
  campaignType: CampaignType;

  @Prop({ type: Object, required: true })
  metrics: {
    reach: {
      total: number;
      unique: number;
      byPlatform?: Record<string, number>;
    };
    engagement: {
      impressions: number;
      clicks: number;
      clickThroughRate: number;
      timeSpent: number;
      bounceRate: number;
    };
    conversion: {
      total: number;
      rate: number;
      bySegment?: Record<string, number>;
      revenue: number;
      costPerConversion: number;
    };
    retention: {
      returnRate: number;
      churnRate: number;
      lifetimeValue: number;
    };
  };

  @Prop({ type: Object })
  audienceInsights: {
    demographics: {
      ageGroups: Record<string, number>;
      gender: Record<string, number>;
      locations: Record<string, number>;
    };
    behavior: {
      peakActivityTimes: Record<string, number>;
      preferredChannels: Record<string, number>;
      deviceTypes: Record<string, number>;
    };
    interests: Record<string, number>;
  };

  @Prop({ type: Object })
  aiRecommendations: {
    optimizationSuggestions: string[];
    audienceSegments: string[];
    contentImprovements: string[];
    budgetAllocation: Record<string, number>;
    predictedPerformance: {
      nextWeek: number;
      nextMonth: number;
      confidence: number;
    };
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CampaignAnalyticsSchema = SchemaFactory.createForClass(CampaignAnalytics);