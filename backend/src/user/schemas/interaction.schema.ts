import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum InteractionType {
  CHAT = 'CHAT',
  EMAIL = 'EMAIL',
  SUPPORT_TICKET = 'SUPPORT_TICKET',
  SYSTEM = 'SYSTEM',
  LOGIN = 'LOGIN',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  DOCUMENT_VIEW = 'DOCUMENT_VIEW',
  FEATURE_USAGE = 'FEATURE_USAGE'
}

export type InteractionDocument = Interaction & Document;

@Schema({ timestamps: true })
export class Interaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: InteractionType })
  type: InteractionType;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  metadata: {
    entityId?: string;
    entityType?: string;
    duration?: number;
    status?: string;
    [key: string]: any;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);