import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesRepController } from './sales-rep.controller';
import { SalesRepService } from './sales-rep.service';
import { Performance, PerformanceSchema } from './schemas/performance.schema';
import { EmailService } from '../common/services/email.service';
import { AIModule } from '../ai/ai.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Performance.name, schema: PerformanceSchema },
    ]),
    AIModule,
    SharedModule,
  ],
  controllers: [SalesRepController],
  providers: [SalesRepService, EmailService],
  exports: [SalesRepService],
})
export class SalesRepModule {}