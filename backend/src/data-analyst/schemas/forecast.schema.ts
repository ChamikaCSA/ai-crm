import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DataAnalystForecastMetric = 'customer_lifetime_value' | 'churn_rate' | 'market_trends' | 'customer_segments';
export type AnalysisType = 'time_series' | 'regression' | 'classification' | 'clustering';

@Schema({ timestamps: true, collection: 'data_analyst_forecasts' })
export class DataAnalystForecast extends Document {
  @Prop({ required: true, enum: ['customer_lifetime_value', 'churn_rate', 'market_trends', 'customer_segments'] })
  metric: DataAnalystForecastMetric;

  @Prop({ required: true, enum: ['time_series', 'regression', 'classification', 'clustering'] })
  analysisType: AnalysisType;

  @Prop({ required: true })
  predictedValue: number;

  @Prop()
  actualValue: number;

  @Prop({ required: true, min: 0, max: 1 })
  confidence: number;

  @Prop({ type: [Number] })
  confidenceInterval: [number, number];

  @Prop({ type: Object })
  metadata: {
    modelVersion: string;
    features: string[];
    parameters: Record<string, any>;
    accuracy: number;
    mae?: number;
    mape?: number;
  };

  @Prop({ required: true })
  timestamp: Date;
}

export const DataAnalystForecastSchema = SchemaFactory.createForClass(DataAnalystForecast);