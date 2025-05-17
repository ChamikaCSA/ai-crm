import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemEventDocument = SystemEvent & Document;

@Schema({ timestamps: true })
export class SystemEvent {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['info', 'warning', 'error', 'critical'] })
  severity: string;

  @Prop()
  source: string;

  @Prop({ type: Object })
  details: Record<string, any>;

  @Prop({ default: false })
  resolved: boolean;

  @Prop()
  resolvedAt: Date;

  @Prop()
  resolvedBy: string;
}

export const SystemEventSchema = SchemaFactory.createForClass(SystemEvent);