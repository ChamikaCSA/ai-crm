import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { SalesManagerService } from './sales-manager.service';
import { CreateReportDto, ReportQueryDto } from './dto/report.dto';
import { CreateForecastDto, ForecastQueryDto } from './dto/forecast.dto';
import { UpdatePipelineDto, PipelineQueryDto } from './dto/pipeline.dto';
import { SalesManagerForecast, SalesManagerForecastMetric } from './schemas/forecast.schema';
import { PipelineStage } from './schemas/pipeline.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { RequestWithUser } from '../common/interfaces/request.interface';
import { Response } from 'express';

@Controller('sales-manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALES_MANAGER)
export class SalesManagerController {
  constructor(
    private readonly salesManagerService: SalesManagerService,
  ) {}

  // Report endpoints
  @Post('reports')
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Req() request: RequestWithUser,
  ) {
    const userId = request.user.id;
    const report = await this.salesManagerService.createReport(createReportDto, userId);
    return {
      success: true,
      data: {
        id: report._id,
        type: report.type,
        format: report.format,
        generatedAt: report.generatedAt,
        status: 'completed',
        downloadUrl: `/api/sales-manager/reports/${report._id}/download`
      }
    };
  }

  @Get('reports')
  async getReports(@Query() query: ReportQueryDto) {
    return this.salesManagerService.getReports(query);
  }

  @Get('reports/:id')
  async getReport(@Param('id') id: string) {
    return this.salesManagerService.getReportById(id);
  }

  @Get('reports/:id/download')
  async downloadReport(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const report = await this.salesManagerService.getReportById(id);

    if (!report.fileContent) {
      throw new Error('Report content not found');
    }

    const contentType = {
      'pdf': 'application/pdf',
      'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'csv': 'text/csv'
    }[report.format];

    const extension = {
      'pdf': 'pdf',
      'excel': 'xlsx',
      'csv': 'csv'
    }[report.format];

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=report-${id}.${extension}`);
    res.setHeader('Content-Length', report.fileSize);

    return res.send(report.fileContent);
  }

  @Delete('reports/:id')
  async deleteReport(@Param('id') id: string) {
    await this.salesManagerService.deleteReport(id);
    return { message: 'Report deleted successfully' };
  }

  // Forecast endpoints
  @Post('forecasts')
  async createForecast(@Body() createForecastDto: CreateForecastDto): Promise<SalesManagerForecast> {
    return this.salesManagerService.createForecast(createForecastDto);
  }

  @Get('forecasts')
  async getForecasts(@Query() query: ForecastQueryDto) {
    const forecasts = await this.salesManagerService.getForecasts(query);
    return {
      success: true,
      data: forecasts
    };
  }

  @Get('forecasts/latest/:metric')
  async getLatestForecast(@Param('metric') metric: SalesManagerForecastMetric) {
    const forecast = await this.salesManagerService.getLatestForecast(metric);
    return {
      success: true,
      data: forecast
    };
  }

  @Put('forecasts/:id/actual')
  async updateActualValue(
    @Param('id') id: string,
    @Body('actualValue') actualValue: number,
  ): Promise<SalesManagerForecast> {
    return this.salesManagerService.updateActualValue(id, actualValue);
  }

  @Get('forecasts/accuracy/:metric')
  async getForecastAccuracy(@Param('metric') metric: SalesManagerForecastMetric) {
    const accuracy = await this.salesManagerService.getForecastAccuracy(metric);
    return {
      success: true,
      data: {
        accuracy,
        confidenceInterval: [0.8, 0.95] // This should come from the actual forecast data
      }
    };
  }

  // Pipeline endpoints
  @Get('pipeline')
  async getPipelineMetrics(@Query() query: PipelineQueryDto) {
    return this.salesManagerService.getPipelineMetrics(query);
  }

  @Get('pipeline/summary')
  async getPipelineSummary() {
    return this.salesManagerService.getPipelineSummary();
  }

  @Put('pipeline/:stage')
  async updatePipelineStage(
    @Param('stage') stage: PipelineStage,
    @Body() updatePipelineDto: UpdatePipelineDto,
  ) {
    return this.salesManagerService.updatePipelineStage(stage, updatePipelineDto);
  }

  @Put('pipeline/recalculate/conversion-rates')
  async recalculateConversionRates() {
    await this.salesManagerService.calculateConversionRates();
    return { message: 'Conversion rates recalculated successfully' };
  }

  @Get('dashboard/summary')
  async getDashboardSummary() {
    return this.salesManagerService.getDashboardSummary();
  }
}