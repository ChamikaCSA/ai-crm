import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get performance metrics and top leads' })
  @ApiQuery({ name: 'period', required: false, enum: ['this_week', 'this_month', 'this_quarter', 'this_year'] })
  async getPerformanceData(@Query('period') period: string = 'this_month') {
    return this.performanceService.getPerformanceData(period);
  }
}