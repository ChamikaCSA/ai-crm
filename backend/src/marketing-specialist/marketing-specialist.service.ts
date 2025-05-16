import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerSegment } from './schemas/customer-segment.schema';
import { SentimentAnalysis, SentimentSource, SentimentType } from './schemas/sentiment-analysis.schema';
import { Campaign, CampaignStatus, CampaignType } from './schemas/campaign.schema';
import { CampaignAnalytics } from './schemas/campaign-analytics.schema';
import { aiService } from '../ai/ai.service';

@Injectable()
export class MarketingSpecialistService {
  constructor(
    @InjectModel(CustomerSegment.name) private customerSegmentModel: Model<CustomerSegment>,
    @InjectModel(SentimentAnalysis.name) private sentimentAnalysisModel: Model<SentimentAnalysis>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(CampaignAnalytics.name) private campaignAnalyticsModel: Model<CampaignAnalytics>,
    private readonly aiService: aiService,
  ) {}

  // Customer Segmentation Methods
  async createCustomerSegment(segmentData: Partial<CustomerSegment>): Promise<CustomerSegment> {
    const segment = new this.customerSegmentModel(segmentData);
    return segment.save();
  }

  async getCustomerSegments(): Promise<CustomerSegment[]> {
    return this.customerSegmentModel.find().exec();
  }

  async updateCustomerSegment(id: string, segmentData: Partial<CustomerSegment>): Promise<CustomerSegment> {
    return this.customerSegmentModel.findByIdAndUpdate(id, segmentData, { new: true }).exec();
  }

  async deleteCustomerSegment(id: string): Promise<void> {
    await this.customerSegmentModel.findByIdAndDelete(id).exec();
  }

  async getSentimentAnalysis(source?: SentimentSource): Promise<SentimentAnalysis[]> {
    const query = source ? { source } : {};
    return this.sentimentAnalysisModel.find(query).exec();
  }

  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
    return this.campaignModel.findByIdAndUpdate(id, campaignData, { new: true }).exec();
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.campaignModel.findByIdAndDelete(id).exec();
  }

  // Campaign Analytics Methods
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    return this.campaignAnalyticsModel.findOne({ campaignId }).exec();
  }

  async updateCampaignAnalytics(campaignId: string, analyticsData: Partial<CampaignAnalytics>): Promise<CampaignAnalytics> {
    return this.campaignAnalyticsModel.findOneAndUpdate(
      { campaignId },
      analyticsData,
      { new: true, upsert: true }
    ).exec();
  }

  async getCampaignPerformanceMetrics(campaignType?: CampaignType): Promise<CampaignAnalytics[]> {
    const query = campaignType ? { campaignType } : {};
    return this.campaignAnalyticsModel.find(query).exec();
  }

  // Segment methods
  async createSegment(segmentData: any, userId: string) {
    try {
      const aiInsights = await this.aiService.generateSegmentInsights(segmentData);

      const segment = new this.customerSegmentModel({
        name: segmentData.name,
        type: segmentData.type,
        description: segmentData.description,
        criteria: segmentData.criteria,
        userId,
        aiInsights,
      });

      const savedSegment = await segment.save();
      return {
        success: true,
        data: savedSegment,
      };
    } catch (error) {
      console.error('Error creating segment:', error);
      throw error;
    }
  }

  async getSegments(query: any) {
    const segments = await this.customerSegmentModel.find(query).sort({ createdAt: -1 });
    return {
      success: true,
      data: segments,
    };
  }

  // Campaign methods
  async createCampaign(campaignData: any, userId: string) {
    try {
      const aiRecommendations = await this.aiService.generateCampaignRecommendations(campaignData);

      const campaign = new this.campaignModel({
        ...campaignData,
        userId,
        status: 'scheduled',
        metrics: {
          reach: 0,
          engagement: 0,
          conversion: 0,
          retention: 0,
        },
        analytics: {
          audienceInsights: {
            demographics: {
              ageGroups: {},
              gender: {},
              locations: {},
            },
            behavior: {
              interests: [],
              purchasePatterns: [],
              engagementLevels: {},
            },
          },
          aiRecommendations,
        },
      });

      return campaign.save();
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async getCampaigns(query: any) {
    const campaigns = await this.campaignModel.find(query).sort({ createdAt: -1 });
    return {
      success: true,
      data: campaigns,
    };
  }

  // Sentiment analysis methods
  async getSentimentAnalyses(query: any) {
    const analyses = await this.sentimentAnalysisModel.find(query).sort({ createdAt: -1 });
    return {
      success: true,
      data: analyses,
    };
  }

  async deleteSentimentAnalysis(id: string): Promise<void> {
    await this.sentimentAnalysisModel.findByIdAndDelete(id).exec();
  }

  async analyzeSentiment(analyzeSentimentDto: any, userId: string) {
    try {
      // Generate sentiment analysis using AI service
      const sentimentAnalysis = await this.aiService.analyzeSentiment(analyzeSentimentDto);

      const analysis = new this.sentimentAnalysisModel({
        ...analyzeSentimentDto,
        userId,
        ...sentimentAnalysis,
      });

      return analysis.save();
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async getDashboardOverview() {
    try {
      // Get active campaigns
      const activeCampaigns = await this.campaignModel.countDocuments({ status: 'active' });
      const totalCampaigns = await this.campaignModel.countDocuments();
      const campaignMetrics = await this.campaignAnalyticsModel.aggregate([
        {
          $group: {
            _id: null,
            totalReach: { $sum: '$metrics.reach' },
            totalEngagement: { $sum: '$metrics.engagement' },
            totalConversion: { $sum: '$metrics.conversion' },
            totalRetention: { $sum: '$metrics.retention' },
          },
        },
      ]);

      // Get segment statistics
      const segments = await this.customerSegmentModel.find();
      const segmentStats = {
        total: segments.length,
        byType: await this.customerSegmentModel.aggregate([
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
            },
          },
        ]),
      };

      // Get sentiment analysis overview
      const sentimentStats = await this.sentimentAnalysisModel.aggregate([
        {
          $group: {
            _id: '$sentiment',
            count: { $sum: 1 },
            averageScore: { $avg: '$score' },
          },
        },
      ]);

      // Get recent activities
      const recentCampaigns = await this.campaignModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name status createdAt metrics');

      const recentSegments = await this.customerSegmentModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name type createdAt');

      const recentSentiments = await this.sentimentAnalysisModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('source sentiment score createdAt');

      return {
        success: true,
        data: {
          campaigns: {
            active: activeCampaigns,
            total: totalCampaigns,
            metrics: campaignMetrics[0] || {
              totalReach: 0,
              totalEngagement: 0,
              totalConversion: 0,
              totalRetention: 0,
            },
          },
          segments: segmentStats,
          sentiment: {
            distribution: sentimentStats,
            recentAnalyses: recentSentiments,
          },
          recentActivity: {
            campaigns: recentCampaigns,
            segments: recentSegments,
            sentiments: recentSentiments,
          },
        },
      };
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      throw error;
    }
  }
}