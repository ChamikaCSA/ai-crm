import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DataAnalystReport, DataAnalystReportType, DataVisualizationType } from './schemas/report.schema';
import { DataAnalystForecast, DataAnalystForecastMetric, AnalysisType } from './schemas/forecast.schema';
import * as PDFDocument from 'pdfkit';
import { DashboardConfig, DashboardConfigDocument } from './schemas/dashboard.schema';

@Injectable()
export class DataAnalystService {
  constructor(
    @InjectModel(DataAnalystReport.name) private reportModel: Model<DataAnalystReport>,
    @InjectModel(DataAnalystForecast.name) private forecastModel: Model<DataAnalystForecast>,
    @InjectModel(DashboardConfig.name)
    private dashboardConfigModel: Model<DashboardConfigDocument>,
  ) {}

  // Report methods
  async createReport(
    type: DataAnalystReportType,
    visualization: DataVisualizationType,
    drillDownLevel: number,
    parameters: Record<string, any>,
  ): Promise<DataAnalystReport> {
    try {
      // Validate required fields
      if (!type || !visualization) {
        throw new BadRequestException('Type and visualization are required fields');
      }

      // Validate drillDownLevel
      if (drillDownLevel < 0) {
        throw new BadRequestException('Drill down level must be a non-negative number');
      }

      const report = new this.reportModel({
        type,
        visualization,
        drillDownLevel,
        parameters: {
          ...parameters,
          metrics: parameters.metrics || [],
          filters: parameters.filters || {},
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        metadata: {
          version: '1.0',
          generatedBy: 'data-analyst',
          processingTime: 0,
          recordCount: 0,
          dataQuality: {
            completeness: 0,
            accuracy: 0,
            consistency: 0,
          },
        },
      });

      // Generate report content
      const reportContent = await this.generateReportContent(report);
      report.fileContent = reportContent;
      report.fileSize = reportContent.length;

      const savedReport = await report.save();
      return this.transformReportForFrontend(savedReport);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create report: ${error.message}`);
    }
  }

  private async generateReportContent(report: DataAnalystReport): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add report header
      doc.fontSize(20).text(`${report.type.replace(/_/g, ' ')} Report`, { align: 'center' });
      doc.moveDown();

      // Add report metadata
      doc.fontSize(12).text(`Generated: ${report.generatedAt.toLocaleString()}`);
      doc.text(`Visualization: ${report.visualization}`);
      doc.text(`Drill-down Level: ${report.drillDownLevel}`);
      doc.moveDown();

      // Add parameters section
      doc.fontSize(14).text('Parameters');
      doc.fontSize(12);
      if (report.parameters.metrics?.length) {
        doc.text(`Metrics: ${report.parameters.metrics.join(', ')}`);
      }
      if (Object.keys(report.parameters.filters || {}).length) {
        doc.text('Filters:');
        Object.entries(report.parameters.filters).forEach(([key, value]) => {
          doc.text(`  ${key}: ${JSON.stringify(value)}`);
        });
      }
      if (report.parameters.timeRange) {
        doc.text(`Time Range: ${new Date(report.parameters.timeRange.start).toLocaleDateString()} to ${new Date(report.parameters.timeRange.end).toLocaleDateString()}`);
      }
      doc.moveDown();

      // Add data quality section
      doc.fontSize(14).text('Data Quality');
      doc.fontSize(12);
      doc.text(`Completeness: ${report.metadata.dataQuality.completeness}%`);
      doc.text(`Accuracy: ${report.metadata.dataQuality.accuracy}%`);
      doc.text(`Consistency: ${report.metadata.dataQuality.consistency}%`);
      doc.moveDown();

      // Add insights section if available
      if (report.metadata.insights?.length) {
        doc.fontSize(14).text('Insights');
        doc.fontSize(12);
        report.metadata.insights.forEach(insight => {
          doc.text(`• ${insight}`);
        });
      }

      doc.end();
    });
  }

  async getReports(): Promise<DataAnalystReport[]> {
    const reports = await this.reportModel.find().sort({ generatedAt: -1 }).exec();
    return reports.map(report => this.transformReportForFrontend(report));
  }

  async getReportById(id: string): Promise<DataAnalystReport> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return this.transformReportForFrontend(report);
  }

  async deleteReport(id: string): Promise<void> {
    const result = await this.reportModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  private transformReportForFrontend(report: DataAnalystReport): any {
    return {
      id: report._id.toString(),
      type: report.type,
      metrics: report.parameters?.metrics || [],
      generatedAt: report.generatedAt.toISOString(),
      status: 'completed',
      downloadUrl: report.fileContent ? `/api/data-analyst/reports/${report._id}/download` : undefined,
      visualization: report.visualization,
      drillDownLevel: report.drillDownLevel,
      parameters: report.parameters,
      metadata: report.metadata,
      fileContent: report.fileContent,
      fileSize: report.fileSize
    };
  }

  // Forecast methods
  async createForecast(
    metric: DataAnalystForecastMetric,
    analysisType: AnalysisType,
    predictedValue: number,
    confidence: number,
    confidenceInterval: [number, number],
    metadata: {
      modelVersion: string;
      features: string[];
      parameters: Record<string, any>;
      accuracy: number;
      mae?: number;
      mape?: number;
    },
  ): Promise<DataAnalystForecast> {
    const forecast = new this.forecastModel({
      metric,
      analysisType,
      predictedValue,
      confidence,
      confidenceInterval,
      metadata,
      timestamp: new Date(),
    });

    return forecast.save();
  }

  async getForecasts(): Promise<DataAnalystForecast[]> {
    return this.forecastModel.find().sort({ timestamp: -1 }).exec();
  }

  async getForecastById(id: string): Promise<DataAnalystForecast> {
    const forecast = await this.forecastModel.findById(id).exec();
    if (!forecast) {
      throw new NotFoundException(`Forecast with ID ${id} not found`);
    }
    return forecast;
  }

  async getForecastAccuracy(): Promise<Record<DataAnalystForecastMetric, number>> {
    const metrics = await this.getDashboardMetrics();
    const accuracy: Record<DataAnalystForecastMetric, number> = {} as Record<DataAnalystForecastMetric, number>;

    for (const metric of metrics) {
      if (metric.forecast) {
        const metricKey = metric.name.toLowerCase().replace(/\s+/g, '_') as DataAnalystForecastMetric;
        accuracy[metricKey] = metric.forecast.confidence;
      }
    }

    return accuracy;
  }

  async deleteForecast(id: string): Promise<void> {
    const result = await this.forecastModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Forecast with ID ${id} not found`);
    }
  }

  // Dashboard metrics for analysis page
  async getDashboardMetrics() {
    // This should be replaced with real data fetching logic
    return [
      {
        name: 'Conversion Rate',
        value: 12.5,
        trend: 15.5,
        change: 5.2,
        target: 15,
        category: 'Sales',
        description: 'Percentage of leads that convert to customers',
        lastUpdated: new Date().toISOString(),
        forecast: {
          value: 14.2,
          confidence: 0.85,
          upperBound: 16.0,
          lowerBound: 12.5
        }
      },
      {
        name: 'Customer Lifetime Value',
        value: 2500,
        trend: 8.2,
        change: 3.1,
        target: 3000,
        category: 'Customer',
        description: 'Average revenue generated per customer over their lifetime',
        lastUpdated: new Date().toISOString(),
        forecast: {
          value: 2800,
          confidence: 0.88,
          upperBound: 3000,
          lowerBound: 2600
        }
      },
      {
        name: 'Churn Rate',
        value: 4.2,
        trend: -12.5,
        change: -2.1,
        target: 3,
        category: 'Customer',
        description: 'Percentage of customers who stop using the service',
        lastUpdated: new Date().toISOString(),
        forecast: {
          value: 3.8,
          confidence: 0.92,
          upperBound: 4.2,
          lowerBound: 3.4
        }
      },
      {
        name: 'Revenue Growth',
        value: 18.5,
        trend: 25.5,
        change: 7.2,
        target: 20,
        category: 'Financial',
        description: 'Year-over-year revenue growth percentage',
        lastUpdated: new Date().toISOString(),
        forecast: {
          value: 22.5,
          confidence: 0.85,
          upperBound: 25.0,
          lowerBound: 20.0
        }
      }
    ];
  }

  // Dashboard trends for analysis page
  async getDashboardTrends() {
    // This should be replaced with real data fetching logic
    return [
      {
        category: 'Sales Pipeline',
        value: 1250000,
        previousValue: 1000000,
        change: 25,
        recommendations: [
          'Focus on high-value opportunities in the pipeline',
          'Implement targeted follow-up strategies',
          'Review and optimize sales cycle duration'
        ]
      },
      {
        category: 'Customer Acquisition',
        value: 850,
        previousValue: 750,
        change: 13.3,
        recommendations: [
          'Optimize marketing channels based on conversion rates',
          'Enhance lead nurturing processes',
          'Review and adjust customer acquisition costs'
        ]
      },
      {
        category: 'Average Deal Size',
        value: 25000,
        previousValue: 22000,
        change: 13.6,
        recommendations: [
          'Identify opportunities for upselling and cross-selling',
          'Review pricing strategies for different customer segments',
          'Focus on high-value product combinations'
        ]
      }
    ];
  }

  async getDashboardConfigs(userId: string): Promise<DashboardConfig[]> {
    return this.dashboardConfigModel.find({ userId }).exec();
  }

  async getDashboardConfig(id: string, userId: string): Promise<DashboardConfig> {
    return this.dashboardConfigModel.findOne({ id, userId }).exec();
  }

  async createDashboardConfig(config: DashboardConfig): Promise<DashboardConfig> {
    // If this is set as default, unset any existing default for this user
    if (config.isDefault) {
      await this.dashboardConfigModel.updateMany(
        { userId: config.userId, isDefault: true },
        { isDefault: false }
      ).exec();
    }
    return this.dashboardConfigModel.create(config);
  }

  async updateDashboardConfig(id: string, userId: string, config: Partial<DashboardConfig>): Promise<DashboardConfig> {
    // If this is being set as default, unset any existing default
    if (config.isDefault) {
      await this.dashboardConfigModel.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      ).exec();
    }
    return this.dashboardConfigModel.findOneAndUpdate(
      { id, userId },
      { $set: config },
      { new: true }
    ).exec();
  }

  async deleteDashboardConfig(id: string, userId: string): Promise<void> {
    await this.dashboardConfigModel.deleteOne({ id, userId }).exec();
  }

  async getOverviewData() {
    try {
      const [metrics, trends, reports] = await Promise.all([
        this.getDashboardMetrics(),
        this.getDashboardTrends(),
        this.getReports()
      ]);

      // Calculate summary statistics
      const totalReports = reports.length;
      const recentReports = reports.filter(r =>
        new Date(r.generatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length;

      const forecastAccuracy = await this.getForecastAccuracy();
      const averageAccuracy = Object.values(forecastAccuracy).reduce((a, b) => a + b, 0) / Object.keys(forecastAccuracy).length;

      // Get top performing metrics
      const topMetrics = metrics
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Get most significant trends
      const significantTrends = trends
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 5);

      // Create latest forecasts from metrics
      const latestForecasts = metrics
        .filter(metric => metric.forecast)
        .map(metric => ({
          metric: metric.name,
          predictedValue: metric.forecast.value,
          confidence: metric.forecast.confidence,
          timestamp: new Date().toISOString()
        }));

      return {
        summary: {
          totalReports,
          recentReports,
          averageForecastAccuracy: Math.round(averageAccuracy * 100),
          dataPointsProcessed: metrics.reduce((sum, m) => sum + m.value, 0),
          growthRate: trends.reduce((sum, t) => sum + t.change, 0) / trends.length
        },
        topMetrics,
        significantTrends,
        latestForecasts,
        recentReports: reports
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
          .slice(0, 5)
          .map(report => ({
            id: report._id,
            type: report.type,
            generatedAt: report.generatedAt,
            visualization: report.visualization
          }))
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get overview data: ${error.message}`);
    }
  }
}