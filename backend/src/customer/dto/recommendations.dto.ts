import { IsString, IsArray, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum RecommendationType {
  FEATURE = 'feature',
  DOCUMENTATION = 'documentation',
  SUPPORT = 'support',
  TRAINING = 'training',
  INTEGRATION = 'integration',
  OPTIMIZATION = 'optimization',
  SECURITY = 'security',
  CUSTOMIZATION = 'customization'
}

export enum RecommendationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export class RecommendationDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(RecommendationType)
  type: RecommendationType;

  @IsNumber()
  score: number;

  @IsEnum(RecommendationPriority)
  priority: RecommendationPriority;

  @IsString()
  @IsOptional()
  action?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  impact?: string;

  @IsString()
  @IsOptional()
  estimatedTime?: string;
}