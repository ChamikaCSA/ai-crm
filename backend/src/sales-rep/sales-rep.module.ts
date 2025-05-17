import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesRepController } from './sales-rep.controller';
import { SalesRepService } from './sales-rep.service';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { Performance, PerformanceSchema } from './schemas/performance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Performance.name, schema: PerformanceSchema },
    ]),
  ],
  controllers: [SalesRepController],
  providers: [SalesRepService],
  exports: [SalesRepService],
})
export class SalesRepModule {}