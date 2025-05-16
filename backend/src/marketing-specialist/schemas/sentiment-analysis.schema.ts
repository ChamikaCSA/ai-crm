import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SentimentSource {
  SOCIAL_MEDIA = 'social_media',
  CUSTOMER_FEEDBACK = 'customer_feedback',
  SUPPORT_TICKETS = 'support_tickets',
  REVIEWS = 'reviews',
  SURVEYS = 'surveys'
}

export enum SentimentType {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}

@Schema({ timestamps: true })
export class SentimentAnalysis extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: SentimentSource })
  source: SentimentSource;

  @Prop({ required: true, enum: SentimentType })
  sentiment: SentimentType;

  @Prop({ required: true })
  score: number;

  @Prop({ type: [String] })
  keywords: string[];

  @Prop({ type: Object })
  metadata: {
    author?: string;
    platform?: string;
    location?: string;
    timestamp?: Date;
    url?: string;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
  };

  @Prop({ type: Object })
  aiInsights: {
    topics: string[];
    emotionBreakdown: {
      joy: number;
      anger: number;
      sadness: number;
      fear: number;
      surprise: number;
    };
    actionItems: string[];
    trendAnalysis: {
      isTrending: boolean;
      trendScore: number;
      relatedTopics: string[];
    };
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const SentimentAnalysisSchema = SchemaFactory.createForClass(SentimentAnalysis);