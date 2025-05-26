import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesManagerController } from './sales-manager.controller';
import { SalesManagerService } from './sales-manager.service';
import { SalesReport, SalesReportSchema } from './schemas/report.schema';
import { SalesManagerForecast, SalesManagerForecastSchema } from './schemas/forecast.schema';
import { Pipeline, PipelineSchema } from './schemas/pipeline.schema';
import { Lead, LeadSchema } from '../sales-rep/schemas/lead.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SalesReport.name, schema: SalesReportSchema },
      { name: SalesManagerForecast.name, schema: SalesManagerForecastSchema },
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SharedModule,
  ],
  controllers: [SalesManagerController],
  providers: [SalesManagerService],
  exports: [SalesManagerService],
})
export class SalesManagerModule {}