import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataAnalystController } from './data-analyst.controller';
import { DataAnalystService } from './data-analyst.service';
import { DataAnalystReport, DataAnalystReportSchema } from './schemas/report.schema';
import { DataAnalystForecast, DataAnalystForecastSchema } from './schemas/forecast.schema';
import { DashboardConfig, DashboardConfigSchema } from './schemas/dashboard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DataAnalystReport.name, schema: DataAnalystReportSchema },
      { name: DataAnalystForecast.name, schema: DataAnalystForecastSchema },
      { name: DashboardConfig.name, schema: DashboardConfigSchema },
    ]),
  ],
  controllers: [DataAnalystController],
  providers: [DataAnalystService],
  exports: [DataAnalystService],
})
export class DataAnalystModule {}
