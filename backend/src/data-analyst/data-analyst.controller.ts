import { Controller, Get, Post, Delete, Param, Body, UseGuards, BadRequestException, Res, Query, Request, Put } from '@nestjs/common';
import { DataAnalystService } from './data-analyst.service';
import { DataAnalystReport, DataAnalystReportType, DataVisualizationType } from './schemas/report.schema';
import { DataAnalystForecast, DataAnalystForecastMetric, AnalysisType } from './schemas/forecast.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { CreateDataAnalystReportDto } from './dto/report.dto';
import { Response } from 'express';
import { DashboardConfig } from './schemas/dashboard.schema';

@Controller('data-analyst')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DATA_ANALYST)
export class DataAnalystController {
  constructor(private readonly dataAnalystService: DataAnalystService) {}

  // Report endpoints
  @Post('reports')
  async createReport(@Body() createReportDto: CreateDataAnalystReportDto) {
    try {
      return await this.dataAnalystService.createReport(
        createReportDto.type,
        createReportDto.visualization,
        createReportDto.drillDownLevel,
        createReportDto.parameters,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('reports')
  async getReports(): Promise<DataAnalystReport[]> {
    return this.dataAnalystService.getReports();
  }

  @Get('reports/:id')
  async getReportById(@Param('id') id: string): Promise<DataAnalystReport> {
    return this.dataAnalystService.getReportById(id);
  }

  @Get('reports/:id/download')
  async downloadReport(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const report = await this.dataAnalystService.getReportById(id);

      if (!report.fileContent) {
        throw new BadRequestException('Report content not found');
      }

      const contentType = 'application/pdf';
      const extension = 'pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${report.type}-${id}.${extension}`);
      res.setHeader('Content-Length', report.fileSize);

      return res.send(report.fileContent);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to download report: ${error.message}`);
    }
  }

  @Delete('reports/:id')
  async deleteReport(@Param('id') id: string): Promise<void> {
    return this.dataAnalystService.deleteReport(id);
  }

  // Forecast endpoints
  @Post('forecasts')
  async createForecast(
    @Body() body: {
      metric: DataAnalystForecastMetric;
      analysisType: AnalysisType;
      predictedValue: number;
      confidence: number;
      confidenceInterval: [number, number];
      metadata: {
        modelVersion: string;
        features: string[];
        parameters: Record<string, any>;
        accuracy: number;
        mae?: number;
        mape?: number;
      };
    },
  ): Promise<DataAnalystForecast> {
    return this.dataAnalystService.createForecast(
      body.metric,
      body.analysisType,
      body.predictedValue,
      body.confidence,
      body.confidenceInterval,
      body.metadata,
    );
  }

  @Get('forecasts')
  async getForecasts(
    @Query('metric') metric?: DataAnalystForecastMetric,
    @Query('analysis') analysisType?: AnalysisType,
    @Query('type') type?: 'latest' | 'accuracy',
  ) {
    if (type === 'latest') {
      const latestForecasts = await this.dataAnalystService.getLatestForecasts();
      return {
        success: true,
        data: metric ? latestForecasts[metric] : latestForecasts
      };
    }

    if (type === 'accuracy') {
      const accuracy = await this.dataAnalystService.getForecastAccuracy();
      return {
        success: true,
        data: {
          accuracy: metric ? accuracy[metric] : accuracy,
          confidenceInterval: metric ? [0.8, 0.95] : null // This should come from the actual forecast data
        }
      };
    }

    const forecasts = await this.dataAnalystService.getForecasts();
    const filteredForecasts = forecasts.filter(forecast => {
      if (metric && forecast.metric !== metric) return false;
      if (analysisType && forecast.analysisType !== analysisType) return false;
      return true;
    });

    return {
      success: true,
      data: filteredForecasts
    };
  }

  @Get('forecasts/:id')
  async getForecastById(@Param('id') id: string): Promise<DataAnalystForecast> {
    return this.dataAnalystService.getForecastById(id);
  }

  @Delete('forecasts/:id')
  async deleteForecast(@Param('id') id: string): Promise<void> {
    return this.dataAnalystService.deleteForecast(id);
  }

  // Dashboard endpoints
  @Get('dashboard/metrics')
  async getDashboardMetrics() {
    return this.dataAnalystService.getDashboardMetrics();
  }

  @Get('dashboard/trends')
  async getDashboardTrends() {
    return this.dataAnalystService.getDashboardTrends();
  }

  @Get('dashboard/trends/export')
  async exportTrendsData(@Res() res: Response) {
    try {
      const trends = await this.dataAnalystService.getDashboardTrends();
      const metrics = await this.dataAnalystService.getDashboardMetrics();

      // Create CSV content
      const csvContent = [
        // Headers
        ['Category', 'Value', 'Previous Value', 'Change', 'Recommendations'].join(','),
        // Trends data
        ...trends.map(trend => [
          trend.category,
          trend.value,
          trend.previousValue,
          trend.change,
          `"${trend.recommendations.join('; ')}"`
        ].join(',')),
        // Add a blank line
        '',
        // Metrics headers
        ['Metric', 'Value', 'Trend', 'Change', 'Target', 'Category', 'Description', 'Last Updated'].join(','),
        // Metrics data
        ...metrics.map(metric => [
          metric.name,
          metric.value,
          metric.trend,
          metric.change,
          metric.target,
          metric.category,
          `"${metric.description}"`,
          metric.lastUpdated
        ].join(','))
      ].join('\n');

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=trends-data.csv');

      return res.send(csvContent);
    } catch (error) {
      throw new BadRequestException(`Failed to export trends data: ${error.message}`);
    }
  }

  @Get('dashboard/analysis/export')
  async exportAnalysisData(@Res() res: Response) {
    try {
      const metrics = await this.dataAnalystService.getDashboardMetrics();
      const trends = await this.dataAnalystService.getDashboardTrends();

      // Create CSV content
      const csvContent = [
        // Headers
        ['Metric', 'Value', 'Trend', 'Change', 'Target', 'Category', 'Description', 'Last Updated'].join(','),
        // Metrics data
        ...metrics.map(metric => [
          metric.name,
          metric.value,
          metric.trend,
          metric.change,
          metric.target,
          metric.category,
          `"${metric.description}"`,
          metric.lastUpdated
        ].join(',')),
        // Add a blank line
        '',
        // Trends headers
        ['Category', 'Value', 'Previous Value', 'Change'].join(','),
        // Trends data
        ...trends.map(trend => [
          trend.category,
          trend.value,
          trend.previousValue,
          trend.change
        ].join(','))
      ].join('\n');

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analysis-data.csv');

      return res.send(csvContent);
    } catch (error) {
      throw new BadRequestException(`Failed to export analysis data: ${error.message}`);
    }
  }

  @Get('dashboard/configs')
  async getDashboardConfigs(@Request() req) {
    return this.dataAnalystService.getDashboardConfigs(req.user.id);
  }

  @Get('dashboard/configs/:id')
  async getDashboardConfig(@Param('id') id: string, @Request() req) {
    return this.dataAnalystService.getDashboardConfig(id, req.user.id);
  }

  @Post('dashboard/configs')
  async createDashboardConfig(@Body() config: DashboardConfig, @Request() req) {
    config.userId = req.user.id;
    return this.dataAnalystService.createDashboardConfig(config);
  }

  @Put('dashboard/configs/:id')
  async updateDashboardConfig(
    @Param('id') id: string,
    @Body() config: Partial<DashboardConfig>,
    @Request() req
  ) {
    return this.dataAnalystService.updateDashboardConfig(id, req.user.id, config);
  }

  @Delete('dashboard/configs/:id')
  async deleteDashboardConfig(@Param('id') id: string, @Request() req) {
    return this.dataAnalystService.deleteDashboardConfig(id, req.user.id);
  }

  @Get('dashboard/overview')
  async getOverviewData() {
    return this.dataAnalystService.getOverviewData();
  }
}