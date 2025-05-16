import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsNumber } from 'class-validator';
import { SentimentSource, SentimentType } from '../schemas/sentiment-analysis.schema';

export class SentimentMetadataDto {
  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsObject()
  @IsOptional()
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export class AnalyzeSentimentDto {
  @IsString()
  content: string;

  @IsEnum(SentimentSource)
  source: SentimentSource;

  @IsObject()
  @IsOptional()
  metadata?: SentimentMetadataDto;
}

export class SentimentAnalysisResponseDto {
  @IsString()
  content: string;

  @IsEnum(SentimentSource)
  source: SentimentSource;

  @IsEnum(SentimentType)
  sentiment: SentimentType;

  @IsNumber()
  score: number;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsObject()
  @IsOptional()
  metadata?: SentimentMetadataDto;

  @IsObject()
  @IsOptional()
  aiInsights?: {
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
}