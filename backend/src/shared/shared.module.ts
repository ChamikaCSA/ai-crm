import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pipeline, PipelineSchema } from '../sales-manager/schemas/pipeline.schema';
import { Lead, LeadSchema } from '../sales-rep/schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
})
export class SharedModule {}