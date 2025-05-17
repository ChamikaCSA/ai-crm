import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SalesReport, SalesReportType, SalesReportFormat } from './schemas/report.schema';
import { SalesManagerForecast, SalesManagerForecastMetric } from './schemas/forecast.schema';
import { Pipeline, PipelineStage } from './schemas/pipeline.schema';
import { CreateReportDto, ReportQueryDto } from './dto/report.dto';
import { CreateForecastDto, ForecastQueryDto } from './dto/forecast.dto';
import { UpdatePipelineDto, PipelineQueryDto } from './dto/pipeline.dto';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

@Injectable()
export class SalesManagerService {
  constructor(
    @InjectModel(SalesReport.name) private reportModel: Model<SalesReport>,
    @InjectModel(SalesManagerForecast.name) private forecastModel: Model<SalesManagerForecast>,
    @InjectModel(Pipeline.name) private pipelineModel: Model<Pipeline>,
  ) {}

  // Report Service Methods
  async createReport(createReportDto: CreateReportDto, userId: string): Promise<SalesReport> {
    try {
      const startDate = new Date(createReportDto.startDate);
      const endDate = new Date(createReportDto.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format provided');
      }

      const report = new this.reportModel({
        name: `${createReportDto.type} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        type: createReportDto.type,
        format: createReportDto.format,
        parameters: {
          startDate,
          endDate,
          metrics: createReportDto.metrics || [],
          filters: createReportDto.filters || {},
          teamId: createReportDto.teamId,
          territoryId: createReportDto.territoryId,
          productId: createReportDto.productId,
          salesRepId: createReportDto.salesRepId,
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        metadata: {
          generatedBy: userId,
          processingTime: 0,
          recordCount: 0,
          salesMetrics: {
            totalRevenue: 0,
            averageDealSize: 0,
            winRate: 0,
            conversionRate: 0,
          },
        },
      });

      const reportContent = await this.generateReportContent(report);
      report.fileContent = reportContent;
      report.fileSize = reportContent.length;

      return report.save();
    } catch (error) {
      console.error('Error generating report:', error);
      throw new InternalServerErrorException(
        `Failed to generate report: ${error.message}`
      );
    }
  }

  async getReports(query: ReportQueryDto): Promise<SalesReport[]> {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    if (query.format) filter.format = query.format;
    if (query.startDate) filter.generatedAt = { $gte: query.startDate };
    if (query.endDate) filter.generatedAt = { ...filter.generatedAt, $lte: query.endDate };

    return this.reportModel
      .find(filter)
      .sort({ generatedAt: -1 })
      .exec();
  }

  async getReportById(id: string): Promise<SalesReport> {
    const report = await this.reportModel.findById(id).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async deleteReport(id: string): Promise<void> {
    await this.reportModel.findByIdAndDelete(id).exec();
  }

  // Forecast Service Methods
  async createForecast(createForecastDto: CreateForecastDto): Promise<SalesManagerForecast> {
    const forecast = new this.forecastModel({
      ...createForecastDto,
      timestamp: new Date(),
    });
    return forecast.save();
  }

  async getForecasts(query: ForecastQueryDto): Promise<SalesManagerForecast[]> {
    const filter: any = {};
    if (query.metric) filter.metric = query.metric;
    if (query.startDate) filter.timestamp = { $gte: query.startDate };
    if (query.endDate) filter.timestamp = { ...filter.timestamp, $lte: query.endDate };
    if (query.minConfidence) filter.confidence = { $gte: query.minConfidence };

    return this.forecastModel
      .find(filter)
      .sort({ timestamp: -1 })
      .exec();
  }

  async updateActualValue(id: string, actualValue: number): Promise<SalesManagerForecast> {
    return this.forecastModel
      .findByIdAndUpdate(
        id,
        { actualValue },
        { new: true }
      )
      .exec();
  }

  async getForecastAccuracy(metric: SalesManagerForecastMetric): Promise<{
    mae: number;
    mape: number;
    accuracy: number;
  }> {
    const forecasts = await this.forecastModel
      .find({
        metric,
        actualValue: { $exists: true }
      })
      .exec();

    if (forecasts.length === 0) {
      return { mae: 0, mape: 0, accuracy: 0 };
    }

    const errors = forecasts.map(f => Math.abs(f.predictedValue - f.actualValue));
    const mae = errors.reduce((sum, error) => sum + error, 0) / errors.length;

    const percentageErrors = forecasts.map(f =>
      Math.abs((f.predictedValue - f.actualValue) / f.actualValue) * 100
    );
    const mape = percentageErrors.reduce((sum, error) => sum + error, 0) / percentageErrors.length;

    const accuracy = 100 - mape;

    return { mae, mape, accuracy };
  }

  async getLatestForecast(metric: SalesManagerForecastMetric): Promise<SalesManagerForecast> {
    return this.forecastModel
      .findOne({ metric })
      .sort({ timestamp: -1 })
      .exec();
  }

  async getForecastMetrics(params: { startDate: Date; endDate: Date }) {
    const forecasts = await this.forecastModel
      .find({
        date: {
          $gte: params.startDate,
          $lte: params.endDate,
        },
      })
      .exec();

    return {
      totalForecasts: forecasts.length,
      accuracy: forecasts.reduce((sum, f) => sum + f.accuracy, 0) / forecasts.length,
      totalValue: forecasts.reduce((sum, f) => sum + f.value, 0),
      forecasts,
    };
  }

  // Pipeline Service Methods
  async getPipelineMetrics(query: PipelineQueryDto): Promise<Pipeline[]> {
    // Return mock pipeline data
    const mockPipelineData = [
      {
        stage: 'LEAD',
        count: 150,
        value: 1500000,
        conversionRate: 0.75
      },
      {
        stage: 'QUALIFIED',
        count: 112,
        value: 1120000,
        conversionRate: 0.85
      },
      {
        stage: 'PROPOSAL',
        count: 95,
        value: 950000,
        conversionRate: 0.65
      },
      {
        stage: 'NEGOTIATION',
        count: 62,
        value: 620000,
        conversionRate: 0.55
      },
      {
        stage: 'CLOSED_WON',
        count: 34,
        value: 340000,
        conversionRate: 1
      },
      {
        stage: 'CLOSED_LOST',
        count: 28,
        value: 280000,
        conversionRate: 0
      }
    ];

    return mockPipelineData as Pipeline[];
  }

  async updatePipelineStage(stage: PipelineStage, data: UpdatePipelineDto): Promise<Pipeline> {
    const pipeline = await this.pipelineModel.findOneAndUpdate(
      { stage },
      { ...data, lastUpdated: new Date() },
      { new: true, upsert: true }
    );
    return pipeline;
  }

  async calculateConversionRates(): Promise<void> {
    const stages = await this.pipelineModel.find().sort({ stage: 1 }).exec();

    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];

      const conversionRate = (nextStage.count / currentStage.count) * 100;
      await this.pipelineModel.updateOne(
        { _id: currentStage._id },
        { conversionRate }
      );
    }
  }

  async getPipelineSummary(): Promise<{
    totalValue: number;
    totalCount: number;
    averageDealSize: number;
    winRate: number;
  }> {
    const pipeline = await this.pipelineModel.find().exec();

    const totalValue = pipeline.reduce((sum, stage) => sum + stage.value, 0);
    const totalCount = pipeline.reduce((sum, stage) => sum + stage.count, 0);
    const wonDeals = pipeline.find(stage => stage.stage === PipelineStage.CLOSED_WON);
    const lostDeals = pipeline.find(stage => stage.stage === PipelineStage.CLOSED_LOST);

    return {
      totalValue,
      totalCount,
      averageDealSize: totalCount > 0 ? totalValue / totalCount : 0,
      winRate: wonDeals && lostDeals
        ? (wonDeals.count / (wonDeals.count + lostDeals.count)) * 100
        : 0
    };
  }

  // Dashboard Summary Methods
  async getDashboardSummary() {
    const [
      pipelineSummary,
      latestForecasts,
      teamPerformance,
      recentReports
    ] = await Promise.all([
      this.getPipelineSummary(),
      this.getLatestForecasts(),
      this.getTeamPerformance(),
      this.getRecentReports()
    ]);

    return {
      pipeline: pipelineSummary,
      forecasts: latestForecasts,
      team: teamPerformance,
      reports: recentReports
    };
  }

  private async getLatestForecasts() {
    const metrics = Object.values(SalesManagerForecastMetric);
    const forecasts = await Promise.all(
      metrics.map(metric => this.getLatestForecast(metric))
    );
    return forecasts.filter(f => f !== null);
  }

  private async getTeamPerformance() {
    // This would typically come from a team performance service
    // For now, returning mock data
    return {
      totalTeamSize: 10,
      activeReps: 8,
      averagePerformance: 85,
      topPerformers: [
        { name: 'John Doe', performance: 95, sales: 150000 },
        { name: 'Jane Smith', performance: 92, sales: 145000 }
      ]
    };
  }

  private async getRecentReports() {
    return this.reportModel
      .find()
      .sort({ generatedAt: -1 })
      .limit(5)
      .exec();
  }

  // Private Report Generation Methods
  private async generateReportContent(report: SalesReport): Promise<Buffer> {
    const startTime = Date.now();
    let data: any;

    try {
      switch (report.type) {
        case SalesReportType.SALES_PERFORMANCE:
          data = await this.generateSalesPerformanceReport(report);
          break;
        case SalesReportType.PIPELINE_ANALYSIS:
          data = await this.generatePipelineAnalysisReport(report);
          break;
        case SalesReportType.FORECAST_ACCURACY:
          data = await this.generateForecastAccuracyReport(report);
          break;
        case SalesReportType.TEAM_PERFORMANCE:
          data = await this.generateTeamPerformanceReport(report);
          break;
        default:
          throw new Error(`Unsupported report type: ${report.type}`);
      }

      let content: Buffer;
      switch (report.format) {
        case SalesReportFormat.PDF:
          content = await this.generatePDF(data, report);
          break;
        case SalesReportFormat.EXCEL:
          content = await this.generateExcel(data, report);
          break;
        case SalesReportFormat.CSV:
          content = await this.generateCSV(data, report);
          break;
        default:
          throw new Error(`Unsupported format: ${report.format}`);
      }

      report.metadata.processingTime = Date.now() - startTime;
      report.metadata.recordCount = Array.isArray(data) ? data.length : 1;

      return content;
    } catch (error) {
      console.error('Error in generateReportContent:', error);
      throw error;
    }
  }

  private async generateSalesPerformanceReport(report: SalesReport): Promise<any> {
    try {
      const { startDate, endDate } = report.parameters || {};
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required for sales performance report');
      }

      const pipelineData = await this.getPipelineMetrics({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      if (!pipelineData || pipelineData.length === 0) {
        return {
          title: 'Sales Performance Report',
          period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
          metrics: {
            totalValue: 0,
            totalLeads: 0,
            conversionRate: 0,
          },
          stages: [],
        };
      }

      return {
        title: 'Sales Performance Report',
        period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
        metrics: {
          totalValue: pipelineData.reduce((sum, stage) => sum + (stage.value || 0), 0),
          totalLeads: pipelineData.reduce((sum, stage) => sum + (stage.count || 0), 0),
          conversionRate: pipelineData[pipelineData.length - 1]?.conversionRate || 0,
        },
        stages: pipelineData,
      };
    } catch (error) {
      console.error('Error generating sales performance report:', error);
      throw error;
    }
  }

  private async generatePipelineAnalysisReport(report: SalesReport): Promise<any> {
    const { startDate, endDate } = report.parameters;
    const pipelineData = await this.getPipelineMetrics({
      startDate,
      endDate,
    });

    return {
      title: 'Pipeline Analysis Report',
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      stages: pipelineData,
      summary: {
        totalStages: pipelineData.length,
        totalValue: pipelineData.reduce((sum, stage) => sum + stage.value, 0),
        totalLeads: pipelineData.reduce((sum, stage) => sum + stage.count, 0),
      },
    };
  }

  private async generateForecastAccuracyReport(report: SalesReport): Promise<any> {
    const { startDate, endDate } = report.parameters;
    const forecastData = await this.getForecastMetrics({
      startDate,
      endDate,
    });

    return {
      title: 'Forecast Accuracy Report',
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      metrics: forecastData,
    };
  }

  private async generateTeamPerformanceReport(report: SalesReport): Promise<any> {
    const { startDate, endDate } = report.parameters;
    const pipelineData = await this.getPipelineMetrics({
      startDate,
      endDate,
    });

    return {
      title: 'Team Performance Report',
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      metrics: {
        totalDeals: pipelineData.reduce((sum, stage) => sum + stage.count, 0),
        totalValue: pipelineData.reduce((sum, stage) => sum + stage.value, 0),
        averageDealSize: pipelineData.reduce((sum, stage) => sum + stage.value, 0) /
                        pipelineData.reduce((sum, stage) => sum + stage.count, 0),
      },
      stages: pipelineData,
    };
  }

  private async generatePDF(data: any, report: SalesReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument();

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(data.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Period: ${data.period}`);
      doc.moveDown();

      if (data.metrics) {
        doc.fontSize(14).text('Key Metrics');
        Object.entries(data.metrics).forEach(([key, value]) => {
          doc.fontSize(12).text(`${key}: ${value}`);
        });
      }

      if (data.stages) {
        doc.moveDown();
        doc.fontSize(14).text('Pipeline Stages');
        data.stages.forEach(stage => {
          doc.fontSize(12).text(`Stage: ${stage.stage}`);
          doc.fontSize(10).text(`Count: ${stage.count}, Value: ${stage.value}`);
          if (stage.conversionRate) {
            doc.fontSize(10).text(`Conversion Rate: ${stage.conversionRate}%`);
          }
          doc.moveDown();
        });
      }

      doc.end();
    });
  }

  private async generateExcel(data: any, report: SalesReport): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
    ];

    if (data.metrics) {
      Object.entries(data.metrics).forEach(([key, value]) => {
        worksheet.addRow({ metric: key, value });
      });
    }

    if (data.stages) {
      worksheet.addRow([]);
      worksheet.addRow(['Pipeline Stages']);
      data.stages.forEach(stage => {
        worksheet.addRow([
          `Stage: ${stage.stage}`,
          `Count: ${stage.count}, Value: ${stage.value}`,
        ]);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async generateCSV(data: any, report: SalesReport): Promise<Buffer> {
    const fields = ['metric', 'value'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data.metrics);
    return Buffer.from(csv);
  }
}