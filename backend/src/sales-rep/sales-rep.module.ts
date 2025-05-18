import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesRepController } from './sales-rep.controller';
import { SalesRepService } from './sales-rep.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { Performance, PerformanceSchema } from './schemas/performance.schema';
import { EmailService } from '../common/services/email.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Performance.name, schema: PerformanceSchema },
    ]),
    AIModule,
  ],
  controllers: [SalesRepController],
  providers: [SalesRepService, EmailService],
  exports: [SalesRepService],
})
export class SalesRepModule {}