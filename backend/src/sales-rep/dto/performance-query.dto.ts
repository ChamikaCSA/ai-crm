import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum PerformancePeriod {
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_QUARTER = 'this_quarter',
  THIS_YEAR = 'this_year',
}

export class PerformanceQueryDto {
  @ApiProperty({
    description: 'Time period for performance metrics',
    enum: PerformancePeriod,
    default: PerformancePeriod.THIS_MONTH,
    required: false,
  })
  @IsEnum(PerformancePeriod)
  @IsOptional()
  period?: PerformancePeriod = PerformancePeriod.THIS_MONTH;
}