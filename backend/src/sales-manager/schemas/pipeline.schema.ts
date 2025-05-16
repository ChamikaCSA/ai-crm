import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PipelineStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

@Schema({ timestamps: true })
export class Pipeline extends Document {
  @Prop({ required: true, enum: PipelineStage })
  stage: PipelineStage;

  @Prop({ required: true, type: Number, default: 0 })
  count: number;

  @Prop({ required: true, type: Number, default: 0 })
  value: number;

  @Prop({ required: true, type: Number, default: 0 })
  conversionRate: number;

  @Prop({ type: Object })
  metrics: {
    averageDealSize: number;
    averageTimeInStage: number;
    winRate: number;
    lossRate: number;
  };

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

export const PipelineSchema = SchemaFactory.createForClass(Pipeline);