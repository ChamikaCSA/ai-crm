import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SalesManagerForecastMetric {
  REVENUE = 'revenue',
  LEADS = 'leads',
  CONVERSION = 'conversion'
}

@Schema({ timestamps: true, collection: 'sales_manager_forecasts' })
export class SalesManagerForecast extends Document {
  @Prop({ required: true, enum: SalesManagerForecastMetric })
  metric: SalesManagerForecastMetric;

  @Prop({ required: true, type: Number })
  predictedValue: number;

  @Prop({ type: Number })
  actualValue: number;

  @Prop({ required: true, type: Number, min: 0, max: 1 })
  confidence: number;

  @Prop({ type: Object })
  factors: {
    historicalTrend: number;
    seasonality: number;
    marketConditions: number;
    teamPerformance: number;
  };

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: Date, required: true })
  predictionDate: Date;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  accuracy: number;

  @Prop({ type: Object })
  metadata: {
    model: string;
    version: string;
    parameters: Record<string, any>;
    confidence: number;
    factors: string[];
    notes: string;
  };
}

export const SalesManagerForecastSchema = SchemaFactory.createForClass(SalesManagerForecast);