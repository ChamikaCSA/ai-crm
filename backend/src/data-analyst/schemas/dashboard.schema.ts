import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DashboardConfigDocument = DashboardConfig & Document;

@Schema({ timestamps: true })
export class DashboardConfig {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true })
  metrics: string[];

  @Prop({ required: true, enum: ['grid', 'list'] })
  layout: 'grid' | 'list';

  @Prop({ required: true, min: 30, max: 3600 })
  refreshInterval: number;

  @Prop({ required: true, default: false })
  isDefault: boolean;

  @Prop({ required: true })
  userId: string;
}

export const DashboardConfigSchema = SchemaFactory.createForClass(DashboardConfig);