import { IsEnum, IsString, IsOptional, IsObject, IsDate, IsArray } from 'class-validator';
import { ReportType, ReportFormat } from '../schemas/report.schema';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @Type(() => Date)
  @IsDate()
  startDate: string | Date;

  @Type(() => Date)
  @IsDate()
  endDate: string | Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: string | Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: string | Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];
}