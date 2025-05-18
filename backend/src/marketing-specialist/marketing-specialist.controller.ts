import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { MarketingSpecialistService } from './marketing-specialist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { CustomerSegment } from './schemas/customer-segment.schema';
import { SentimentAnalysis, SentimentSource } from './schemas/sentiment-analysis.schema';
import { Campaign, CampaignStatus, CampaignType } from './schemas/campaign.schema';
import { CampaignAnalytics } from './schemas/campaign-analytics.schema';
import { RequestWithUser } from '../common/interfaces/request.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MARKETING_SPECIALIST)
@Controller('marketing-specialist')
export class MarketingSpecialistController {
  constructor(
    private readonly marketingSpecialistService: MarketingSpecialistService,
  ) {}

  // Customer Segmentation Endpoints
  @Post('segments')
  async createSegment(
    @Body() createSegmentDto: any,
    @Req() request: RequestWithUser,
  ) {
    try {
      const userId = request.user.id;
      const segment = await this.marketingSpecialistService.createSegment(createSegmentDto, userId);
      return {
        success: true,
        data: segment,
      };
    } catch (error) {
      console.error('Error creating segment:', error);
      throw new HttpException(
        error.message || 'Failed to create segment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('segments')
  async getSegments(@Query() query: any) {
    return this.marketingSpecialistService.getSegments(query);
  }

  @Put('segments/:id')
  async updateCustomerSegment(
    @Param('id') id: string,
    @Body() segmentData: Partial<CustomerSegment>,
  ) {
    return this.marketingSpecialistService.updateCustomerSegment(id, segmentData);
  }

  @Delete('segments/:id')
  async deleteCustomerSegment(@Param('id') id: string) {
    await this.marketingSpecialistService.deleteCustomerSegment(id);
    return { message: 'Customer segment deleted successfully' };
  }

  // Sentiment Analysis Endpoints
  @Get('sentiment')
  async getSentimentAnalyses(@Query() query: any) {
    return this.marketingSpecialistService.getSentimentAnalyses(query);
  }

  @Post('sentiment')
  async analyzeSentiment(
    @Body() analyzeSentimentDto: any,
    @Req() request: RequestWithUser,
  ) {
    try {
      const userId = request.user.id;
      const analysis = await this.marketingSpecialistService.analyzeSentiment(analyzeSentimentDto, userId);
      return {
        success: true,
        data: {
          _id: analysis._id,
          content: analysis.content,
          source: analysis.source,
          sentiment: analysis.sentiment,
          score: analysis.score,
          keywords: analysis.keywords,
          metadata: analysis.metadata,
          aiInsights: analysis.aiInsights,
          createdAt: analysis.createdAt,
        }
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw new HttpException(
        error.message || 'Failed to analyze sentiment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Campaign Management Endpoints
  @Post('campaigns')
  async createCampaign(
    @Body() createCampaignDto: any,
    @Req() request: RequestWithUser,
  ) {
    try {
      const userId = request.user.id;
      const campaign = await this.marketingSpecialistService.createCampaign(createCampaignDto, userId);
      return {
        success: true,
        data: campaign,
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new HttpException(
        error.message || 'Failed to create campaign',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('campaigns')
  async getCampaigns(@Query() query: any) {
    return this.marketingSpecialistService.getCampaigns(query);
  }

  @Put('campaigns/:id')
  async updateCampaign(
    @Param('id') id: string,
    @Body() campaignData: Partial<Campaign>,
  ) {
    return this.marketingSpecialistService.updateCampaign(id, campaignData);
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    await this.marketingSpecialistService.deleteCampaign(id);
    return { message: 'Campaign deleted successfully' };
  }

  @Delete('sentiment/:id')
  async deleteSentimentAnalysis(@Param('id') id: string) {
    await this.marketingSpecialistService.deleteSentimentAnalysis(id);
    return { message: 'Sentiment analysis deleted successfully' };
  }

  // Campaign Analytics Endpoints
  @Get('campaigns/:id/analytics')
  async getCampaignAnalytics(@Param('id') campaignId: string) {
    return this.marketingSpecialistService.getCampaignAnalytics(campaignId);
  }

  @Put('campaigns/:id/analytics')
  async updateCampaignAnalytics(
    @Param('id') campaignId: string,
    @Body() analyticsData: Partial<CampaignAnalytics>,
  ) {
    return this.marketingSpecialistService.updateCampaignAnalytics(campaignId, analyticsData);
  }

  @Get('campaigns/analytics/performance')
  async getCampaignPerformanceMetrics(@Query('type') type?: CampaignType) {
    return this.marketingSpecialistService.getCampaignPerformanceMetrics(type);
  }

  @Get('dashboard/overview')
  async getDashboardOverview() {
    try {
      const overview = await this.marketingSpecialistService.getDashboardOverview();
      return {
        success: true,
        data: overview,
      };
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      throw new HttpException(
        error.message || 'Failed to get dashboard overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}