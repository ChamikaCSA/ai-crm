import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SalesReportType {
  SALES_PERFORMANCE = 'sales_performance',
  PIPELINE_ANALYSIS = 'pipeline_analysis',
  FORECAST_ACCURACY = 'forecast_accuracy',
  TEAM_PERFORMANCE = 'team_performance',
  REVENUE_ANALYSIS = 'revenue_analysis',
  PRODUCT_PERFORMANCE = 'product_performance',
  TERRITORY_ANALYSIS = 'territory_analysis'
}

export enum SalesReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}

@Schema({ timestamps: true })
export class SalesReport extends Document {
  @Prop({ required: true, enum: SalesReportType })
  type: SalesReportType;

  @Prop({ required: true, enum: SalesReportFormat })
  format: SalesReportFormat;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Object })
  parameters: {
    startDate: Date;
    endDate: Date;
    metrics: string[];
    filters: Record<string, any>;
    teamId?: string;
    territoryId?: string;
    productId?: string;
    salesRepId?: string;
  };

  @Prop({ type: Buffer })
  fileContent: Buffer;

  @Prop({ type: String })
  fileUrl: string;

  @Prop({ type: String })
  fileKey: string;

  @Prop({ type: Number })
  fileSize: number;

  @Prop({ type: Date })
  generatedAt: Date;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: Object })
  metadata: {
    generatedBy: string;
    processingTime: number;
    recordCount: number;
    salesMetrics?: {
      totalRevenue: number;
      averageDealSize: number;
      winRate: number;
      conversionRate: number;
    };
    teamMetrics?: {
      quota: number;
      attainment: number;
      performance: number;
    };
  };
}

export const SalesReportSchema = SchemaFactory.createForClass(SalesReport);