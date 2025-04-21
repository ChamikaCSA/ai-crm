import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InteractionDocument = Interaction & Document;

@Schema({ timestamps: true })
export class Interaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object })
  data: any;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);