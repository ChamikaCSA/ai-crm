import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum DataAnalystReportType {
  CUSTOMER_ANALYTICS = 'customer_analytics',
  TREND_ANALYSIS = 'trend_analysis',
  PREDICTIVE_INSIGHTS = 'predictive_insights',
  SEGMENTATION_ANALYSIS = 'segmentation_analysis',
  MARKET_ANALYSIS = 'market_analysis',
  BEHAVIOR_ANALYSIS = 'behavior_analysis'
}

export enum DataVisualizationType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  RADAR = 'radar',
  TREE_MAP = 'tree_map',
  NETWORK = 'network'
}

@Schema({ timestamps: true })
export class DataAnalystReport extends Document {
  @Prop({ required: true, enum: DataAnalystReportType })
  type: DataAnalystReportType;

  @Prop({ required: true, enum: DataVisualizationType })
  visualization: DataVisualizationType;

  @Prop({ required: true, default: 0 })
  drillDownLevel: number;

  @Prop({ type: Object })
  parameters: {
    metrics: string[];
    filters: Record<string, any>;
    timeRange?: {
      start: Date;
      end: Date;
    };
    analysisDepth?: number;
    confidenceThreshold?: number;
    segmentSize?: number;
  };

  @Prop()
  fileContent: Buffer;

  @Prop()
  fileSize: number;

  @Prop({ required: true })
  generatedAt: Date;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: Object })
  metadata: {
    generatedBy: string;
    processingTime: number;
    recordCount: number;
    confidenceScore?: number;
    modelVersion?: string;
    dataQuality?: {
      completeness: number;
      accuracy: number;
      consistency: number;
    };
    insights?: string[];
  };
}

export const DataAnalystReportSchema = SchemaFactory.createForClass(DataAnalystReport);