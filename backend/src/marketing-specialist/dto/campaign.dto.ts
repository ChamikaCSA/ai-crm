import { IsString, IsEnum, IsObject, IsOptional, IsArray, IsDate, IsNumber } from 'class-validator';
import { CampaignType, CampaignStatus } from '../schemas/campaign.schema';

export class CampaignContentDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsObject()
  @IsOptional()
  callToAction?: {
    text: string;
    url: string;
  };
}

export class CampaignScheduleDto {
  @IsDate()
  startDate: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  timezone: string;

  @IsObject()
  @IsOptional()
  frequency?: {
    type: string;
    interval: number;
  };
}

export class CampaignSettingsDto {
  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsNumber()
  @IsOptional()
  maxRecipients?: number;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  customParameters?: Record<string, any>;
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(CampaignType)
  type: CampaignType;

  @IsArray()
  @IsString({ each: true })
  targetSegments: string[];

  @IsObject()
  content: CampaignContentDto;

  @IsObject()
  schedule: CampaignScheduleDto;

  @IsObject()
  @IsOptional()
  settings?: CampaignSettingsDto;
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetSegments?: string[];

  @IsObject()
  @IsOptional()
  content?: CampaignContentDto;

  @IsObject()
  @IsOptional()
  schedule?: CampaignScheduleDto;

  @IsObject()
  @IsOptional()
  settings?: CampaignSettingsDto;
}