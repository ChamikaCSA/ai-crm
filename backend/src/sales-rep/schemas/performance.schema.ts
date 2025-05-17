import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Performance extends Document {
  @ApiProperty({ description: 'Sales representative ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  salesRepId: string;

  @ApiProperty({ description: 'Period start date' })
  @Prop({ required: true })
  periodStart: Date;

  @ApiProperty({ description: 'Period end date' })
  @Prop({ required: true })
  periodEnd: Date;

  @ApiProperty({ description: 'Total number of leads' })
  @Prop({ type: Number, default: 0 })
  totalLeads: number;

  @ApiProperty({ description: 'Number of qualified leads' })
  @Prop({ type: Number, default: 0 })
  qualifiedLeads: number;

  @ApiProperty({ description: 'Conversion rate percentage' })
  @Prop({ type: Number, default: 0 })
  conversionRate: number;

  @ApiProperty({ description: 'Total deal value' })
  @Prop({ type: Number, default: 0 })
  totalValue: number;

  @ApiProperty({ description: 'Average deal size' })
  @Prop({ type: Number, default: 0 })
  averageDealSize: number;

  @ApiProperty({ description: 'Number of closed won deals' })
  @Prop({ type: Number, default: 0 })
  closedWon: number;

  @ApiProperty({ description: 'Number of closed lost deals' })
  @Prop({ type: Number, default: 0 })
  closedLost: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);