import { IsString, IsEnum, IsObject, IsOptional, IsNumber, IsArray } from 'class-validator';
import { CampaignType } from '../schemas/campaign.schema';

export class CampaignMetricsDto {
  @IsObject()
  reach: {
    total: number;
    unique: number;
    byPlatform?: Record<string, number>;
  };

  @IsObject()
  engagement: {
    impressions: number;
    clicks: number;
    clickThroughRate: number;
    timeSpent: number;
    bounceRate: number;
  };

  @IsObject()
  conversion: {
    total: number;
    rate: number;
    bySegment?: Record<string, number>;
    revenue: number;
    costPerConversion: number;
  };

  @IsObject()
  retention: {
    returnRate: number;
    churnRate: number;
    lifetimeValue: number;
  };
}

export class AudienceInsightsDto {
  @IsObject()
  demographics: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };

  @IsObject()
  behavior: {
    peakActivityTimes: Record<string, number>;
    preferredChannels: Record<string, number>;
    deviceTypes: Record<string, number>;
  };

  @IsObject()
  interests: Record<string, number>;
}

export class AIRecommendationsDto {
  @IsArray()
  @IsString({ each: true })
  optimizationSuggestions: string[];

  @IsArray()
  @IsString({ each: true })
  audienceSegments: string[];

  @IsArray()
  @IsString({ each: true })
  contentImprovements: string[];

  @IsObject()
  budgetAllocation: Record<string, number>;

  @IsObject()
  predictedPerformance: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
}

export class CreateCampaignAnalyticsDto {
  @IsString()
  campaignId: string;

  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @IsObject()
  metrics: CampaignMetricsDto;

  @IsObject()
  @IsOptional()
  audienceInsights?: AudienceInsightsDto;

  @IsObject()
  @IsOptional()
  aiRecommendations?: AIRecommendationsDto;
}

export class UpdateCampaignAnalyticsDto {
  @IsObject()
  @IsOptional()
  metrics?: CampaignMetricsDto;

  @IsObject()
  @IsOptional()
  audienceInsights?: AudienceInsightsDto;

  @IsObject()
  @IsOptional()
  aiRecommendations?: AIRecommendationsDto;
}