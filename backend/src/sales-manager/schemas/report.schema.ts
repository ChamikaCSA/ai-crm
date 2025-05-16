import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ReportType {
  SALES_PERFORMANCE = 'sales_performance',
  PIPELINE_ANALYSIS = 'pipeline_analysis',
  FORECAST_ACCURACY = 'forecast_accuracy',
  TEAM_PERFORMANCE = 'team_performance'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv'
}

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ required: true, enum: ReportType })
  type: ReportType;

  @Prop({ required: true, enum: ReportFormat })
  format: ReportFormat;

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
  };
}

export const ReportSchema = SchemaFactory.createForClass(Report);