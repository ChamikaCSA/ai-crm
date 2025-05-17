import { IsEnum, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { DataAnalystReportType, DataVisualizationType } from '../schemas/report.schema';

export class CreateDataAnalystReportDto {
  @IsEnum(DataAnalystReportType)
  type: DataAnalystReportType;

  @IsEnum(DataVisualizationType)
  visualization: DataVisualizationType;

  @IsNumber()
  drillDownLevel: number;

  @IsObject()
  @IsOptional()
  parameters?: {
    metrics?: string[];
    filters?: Record<string, any>;
    timeRange?: {
      start: Date;
      end: Date;
    };
    analysisDepth?: number;
    confidenceThreshold?: number;
    segmentSize?: number;
  };
}