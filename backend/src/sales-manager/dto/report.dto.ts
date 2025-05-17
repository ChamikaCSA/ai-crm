import { IsEnum, IsString, IsOptional, IsObject, IsDate, IsArray } from 'class-validator';
import { SalesReportType, SalesReportFormat } from '../schemas/report.schema';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsEnum(SalesReportType)
  type: SalesReportType;

  @IsEnum(SalesReportFormat)
  format: SalesReportFormat;

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

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  territoryId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  salesRepId?: string;
}

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(SalesReportType)
  type?: SalesReportType;

  @IsOptional()
  @IsEnum(SalesReportFormat)
  format?: SalesReportFormat;

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

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  territoryId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  salesRepId?: string;
}