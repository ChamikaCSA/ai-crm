import { IsEnum, IsNumber, IsOptional, IsObject, IsDate } from 'class-validator';
import { PipelineStage } from '../schemas/pipeline.schema';
import { Type } from 'class-transformer';

export class UpdatePipelineDto {
  @IsEnum(PipelineStage)
  stage: PipelineStage;

  @IsNumber()
  count: number;

  @IsNumber()
  value: number;

  @IsNumber()
  conversionRate: number;

  @IsOptional()
  @IsObject()
  metrics?: {
    averageDealSize: number;
    averageTimeInStage: number;
    winRate: number;
    lossRate: number;
  };
}

export class PipelineQueryDto {
  @IsOptional()
  @IsEnum(PipelineStage)
  stage?: PipelineStage;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
