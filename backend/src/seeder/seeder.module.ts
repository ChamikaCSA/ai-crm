import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Lead, LeadSchema } from '../sales-rep/schemas/lead.schema';
import { Campaign, CampaignSchema } from '../marketing-specialist/schemas/campaign.schema';
import { CustomerSegment, CustomerSegmentSchema } from '../marketing-specialist/schemas/customer-segment.schema';
import { SupportTicket, SupportTicketSchema } from '../customer/schemas/support-ticket.schema';
import { AuditLog, AuditLogSchema } from '../audit/schemas/audit.schema';
import { Interaction, InteractionSchema } from '../user/schemas/interaction.schema';
import { Performance, PerformanceSchema } from '../sales-rep/schemas/performance.schema';
import { SentimentAnalysis, SentimentAnalysisSchema } from '../marketing-specialist/schemas/sentiment-analysis.schema';
import { DataAnalystReport, DataAnalystReportSchema } from '../data-analyst/schemas/report.schema';
import { SalesManagerForecast, SalesManagerForecastSchema } from '../sales-manager/schemas/forecast.schema';
import { CampaignAnalytics, CampaignAnalyticsSchema } from '../marketing-specialist/schemas/campaign-analytics.schema';
import { Recommendation, RecommendationSchema } from '../customer/schemas/recommendation.schema';
import { DashboardConfig, DashboardConfigSchema } from '../data-analyst/schemas/dashboard.schema';
import { SalesReport, SalesReportSchema } from '../sales-manager/schemas/report.schema';
import { Pipeline, PipelineSchema } from '../sales-manager/schemas/pipeline.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: CustomerSegment.name, schema: CustomerSegmentSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Interaction.name, schema: InteractionSchema },
      { name: Performance.name, schema: PerformanceSchema },
      { name: SentimentAnalysis.name, schema: SentimentAnalysisSchema },
      { name: DataAnalystReport.name, schema: DataAnalystReportSchema },
      { name: SalesManagerForecast.name, schema: SalesManagerForecastSchema },
      { name: CampaignAnalytics.name, schema: CampaignAnalyticsSchema },
      { name: Recommendation.name, schema: RecommendationSchema },
      { name: DashboardConfig.name, schema: DashboardConfigSchema },
      { name: SalesReport.name, schema: SalesReportSchema },
      { name: Pipeline.name, schema: PipelineSchema },
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}