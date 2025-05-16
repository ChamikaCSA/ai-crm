import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingSpecialistController } from './marketing-specialist.controller';
import { MarketingSpecialistService } from './marketing-specialist.service';
import { CustomerSegment, CustomerSegmentSchema } from './schemas/customer-segment.schema';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import { SentimentAnalysis, SentimentAnalysisSchema } from './schemas/sentiment-analysis.schema';
import { CampaignAnalytics, CampaignAnalyticsSchema } from './schemas/campaign-analytics.schema';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerSegment.name, schema: CustomerSegmentSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: SentimentAnalysis.name, schema: SentimentAnalysisSchema },
      { name: CampaignAnalytics.name, schema: CampaignAnalyticsSchema },
    ]),
    AIModule,
  ],
  controllers: [MarketingSpecialistController],
  providers: [MarketingSpecialistService],
  exports: [MarketingSpecialistService],
})
export class MarketingSpecialistModule {}