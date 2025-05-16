import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesManagerController } from './sales-manager.controller';
import { SalesManagerService } from './sales-manager.service';
import { Pipeline, PipelineSchema } from './schemas/pipeline.schema';
import { Forecast, ForecastSchema } from './schemas/forecast.schema';
import { Report, ReportSchema } from './schemas/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pipeline.name, schema: PipelineSchema },
      { name: Forecast.name, schema: ForecastSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [SalesManagerController],
  providers: [SalesManagerService],
  exports: [SalesManagerService],
})
export class SalesManagerModule {}