import { IsEnum, IsNumber, IsDate, IsOptional, IsObject, Min, Max } from 'class-validator';
import { SalesManagerForecastMetric } from '../schemas/forecast.schema';

export class CreateForecastDto {
  @IsEnum(SalesManagerForecastMetric)
  metric: SalesManagerForecastMetric;

  @IsNumber()
  predictedValue: number;

  @IsOptional()
  @IsNumber()
  actualValue?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsOptional()
  @IsObject()
  factors?: {
    historicalTrend: number;
    seasonality: number;
    marketConditions: number;
    teamPerformance: number;
  };

  @IsDate()
  predictionDate: Date;

  @IsOptional()
  @IsObject()
  metadata?: {
    model: string;
    version: string;
    parameters: Record<string, any>;
  };
}

export class ForecastQueryDto {
  @IsOptional()
  @IsEnum(SalesManagerForecastMetric)
  metric?: SalesManagerForecastMetric;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;
}