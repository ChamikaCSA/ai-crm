import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../user/schemas/user.schema';
import { Lead, LeadStatus, LeadSource, PreferredContactMethod } from '../sales-rep/schemas/lead.schema';
import { Campaign, CampaignType, CampaignStatus } from '../marketing-specialist/schemas/campaign.schema';
import { CustomerSegment, SegmentType } from '../marketing-specialist/schemas/customer-segment.schema';
import { SupportTicket, SupportTicketStatus, SupportTicketPriority, SupportTicketCategory } from '../customer/schemas/support-ticket.schema';
import { AuditLog, AuditAction } from '../audit/schemas/audit.schema';
import { Interaction, InteractionType } from '../user/schemas/interaction.schema';
import { Performance } from '../sales-rep/schemas/performance.schema';
import { SentimentAnalysis, SentimentSource } from '../marketing-specialist/schemas/sentiment-analysis.schema';
import { DataAnalystReport, DataAnalystReportType } from '../data-analyst/schemas/report.schema';
import { SalesManagerForecast } from '../sales-manager/schemas/forecast.schema';
import { CampaignAnalytics } from '../marketing-specialist/schemas/campaign-analytics.schema';
import { Recommendation } from '../customer/schemas/recommendation.schema';
import { DashboardConfig } from '../data-analyst/schemas/dashboard.schema';
import { SalesReport, SalesReportType, SalesReportFormat } from '../sales-manager/schemas/report.schema';
import { Pipeline, PipelineStage } from '../sales-manager/schemas/pipeline.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    @InjectModel(CustomerSegment.name) private customerSegmentModel: Model<CustomerSegment>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicket>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
    @InjectModel(Performance.name) private performanceModel: Model<Performance>,
    @InjectModel(SentimentAnalysis.name) private sentimentAnalysisModel: Model<SentimentAnalysis>,
    @InjectModel(DataAnalystReport.name) private dataAnalystReportModel: Model<DataAnalystReport>,
    @InjectModel(SalesManagerForecast.name) private salesManagerForecastModel: Model<SalesManagerForecast>,
    @InjectModel(CampaignAnalytics.name) private campaignAnalyticsModel: Model<CampaignAnalytics>,
    @InjectModel(Recommendation.name) private recommendationModel: Model<Recommendation>,
    @InjectModel(DashboardConfig.name) private dashboardConfigModel: Model<DashboardConfig>,
    @InjectModel(SalesReport.name) private salesReportModel: Model<SalesReport>,
    @InjectModel(Pipeline.name) private pipelineModel: Model<Pipeline>,
  ) {}

  async deleteAll() {
    await Promise.all([
      this.userModel.deleteMany({}),
      this.leadModel.deleteMany({}),
      this.campaignModel.deleteMany({}),
      this.customerSegmentModel.deleteMany({}),
      this.supportTicketModel.deleteMany({}),
      this.auditLogModel.deleteMany({}),
      this.interactionModel.deleteMany({}),
      this.performanceModel.deleteMany({}),
      this.sentimentAnalysisModel.deleteMany({}),
      this.dataAnalystReportModel.deleteMany({}),
      this.salesManagerForecastModel.deleteMany({}),
      this.campaignAnalyticsModel.deleteMany({}),
      this.recommendationModel.deleteMany({}),
      this.dashboardConfigModel.deleteMany({}),
      this.salesReportModel.deleteMany({}),
      this.pipelineModel.deleteMany({}),
    ]);
  }

  async seed() {
    await this.seedUsers();
    await this.seedPipelines();
    await this.seedLeads();
    await this.seedCampaigns();
    await this.seedCustomerSegments();
    await this.seedSupportTickets();
    await this.seedAuditLogs();
    await this.seedInteractions();
    await this.seedPerformance();
    await this.seedSentimentAnalysis();
    await this.seedDataAnalystReports();
    await this.seedSalesManagerForecasts();
    await this.seedCampaignAnalytics();
    await this.seedRecommendations();
    await this.seedDashboardConfigs();
    await this.seedSalesReports();
  }

  private async seedUsers() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isEmailVerified: true,
      },
      {
        email: 'sales.rep@example.com',
        password: hashedPassword,
        firstName: 'Sales',
        lastName: 'Rep',
        role: UserRole.SALES_REP,
        isEmailVerified: true,
      },
      {
        email: 'sales.manager@example.com',
        password: hashedPassword,
        firstName: 'Sales',
        lastName: 'Manager',
        role: UserRole.SALES_MANAGER,
        isEmailVerified: true,
      },
      {
        email: 'marketing@example.com',
        password: hashedPassword,
        firstName: 'Marketing',
        lastName: 'Specialist',
        role: UserRole.MARKETING_SPECIALIST,
        isEmailVerified: true,
      },
      {
        email: 'data.analyst@example.com',
        password: hashedPassword,
        firstName: 'Data',
        lastName: 'Analyst',
        role: UserRole.DATA_ANALYST,
        isEmailVerified: true,
      },
      {
        email: 'customer@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
      },
    ];
    const createdUsers = await this.userModel.insertMany(users);
    return createdUsers;
  }

  private async seedLeads() {
    const leads = [
      {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Corp',
        jobTitle: 'CEO',
        email: 'john@techcorp.com',
        phone: '+1234567890',
        status: LeadStatus.NEW,
        source: LeadSource.WEBSITE,
        leadScore: 85,
        notes: 'Interested in enterprise solution',
        preferences: {
          budget: 50000,
          preferredContactMethod: PreferredContactMethod.EMAIL,
          timeline: 'Q3 2024'
        }
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Digital Solutions',
        jobTitle: 'CTO',
        email: 'jane@digitalsolutions.com',
        phone: '+1987654321',
        status: LeadStatus.CONTACTED,
        source: LeadSource.REFERRAL,
        leadScore: 75,
        notes: 'Looking for cloud migration services',
        preferences: {
          budget: 75000,
          preferredContactMethod: PreferredContactMethod.PHONE,
          timeline: 'Q2 2024'
        }
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        company: 'Global Tech',
        jobTitle: 'Director',
        email: 'mike@globaltech.com',
        phone: '+1122334455',
        status: LeadStatus.QUALIFIED,
        source: LeadSource.WEBSITE,
        leadScore: 90,
        notes: 'Ready for proposal',
        preferences: {
          budget: 100000,
          preferredContactMethod: PreferredContactMethod.EMAIL,
          timeline: 'Q2 2024'
        }
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        company: 'Innovate Inc',
        jobTitle: 'VP',
        email: 'sarah@innovate.com',
        phone: '+1555666777',
        status: LeadStatus.PROPOSAL,
        source: LeadSource.REFERRAL,
        leadScore: 95,
        notes: 'Reviewing proposal',
        preferences: {
          budget: 150000,
          preferredContactMethod: PreferredContactMethod.PHONE,
          timeline: 'Q2 2024'
        }
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        company: 'Tech Solutions',
        jobTitle: 'CEO',
        email: 'david@techsolutions.com',
        phone: '+1888999000',
        status: LeadStatus.NEGOTIATION,
        source: LeadSource.WEBSITE,
        leadScore: 88,
        notes: 'Finalizing terms',
        preferences: {
          budget: 200000,
          preferredContactMethod: PreferredContactMethod.EMAIL,
          timeline: 'Q2 2024'
        }
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        company: 'Digital Corp',
        jobTitle: 'CTO',
        email: 'lisa@digitalcorp.com',
        phone: '+1777888999',
        status: LeadStatus.CLOSED_WON,
        source: LeadSource.REFERRAL,
        leadScore: 92,
        notes: 'Deal closed successfully',
        preferences: {
          budget: 175000,
          preferredContactMethod: PreferredContactMethod.EMAIL,
          timeline: 'Q1 2024'
        }
      },
      {
        firstName: 'Tom',
        lastName: 'Wilson',
        company: 'Tech Innovators',
        jobTitle: 'Director',
        email: 'tom@techinnovators.com',
        phone: '+1666777888',
        status: LeadStatus.CLOSED_LOST,
        source: LeadSource.WEBSITE,
        leadScore: 70,
        notes: 'Went with competitor',
        preferences: {
          budget: 120000,
          preferredContactMethod: PreferredContactMethod.PHONE,
          timeline: 'Q1 2024'
        }
      }
    ];

    // Create leads one by one to ensure proper pipeline updates
    for (const lead of leads) {
      const createdLead = await this.leadModel.create(lead);
      await this.updatePipelineMetrics(createdLead);
    }
  }

  private async updatePipelineMetrics(lead: Lead): Promise<void> {
    try {
      // Map LeadStatus to PipelineStage
      const pipelineStage = this.mapLeadStatusToPipelineStage(lead.status);

      // Get current pipeline stage data
      const currentStage = await this.pipelineModel.findOne({ stage: pipelineStage });

      // Calculate new metrics
      const newCount = (currentStage?.count || 0) + 1;
      const newValue = (currentStage?.value || 0) + (lead.preferences?.budget || 0);

      // Update pipeline stage
      await this.pipelineModel.findOneAndUpdate(
        { stage: pipelineStage },
        {
          count: newCount,
          value: newValue,
          lastUpdated: new Date(),
          metrics: {
            averageDealSize: newValue / newCount,
            averageTimeInStage: 0, // Calculate based on lead history
            winRate: pipelineStage === PipelineStage.CLOSED_WON ? 100 : 0,
            lossRate: pipelineStage === PipelineStage.CLOSED_LOST ? 100 : 0
          }
        },
        { upsert: true }
      );

      // Recalculate conversion rates
      await this.calculateConversionRates();
    } catch (error) {
      console.error('Failed to update pipeline metrics:', error);
      throw error;
    }
  }

  private mapLeadStatusToPipelineStage(status: LeadStatus): PipelineStage {
    // Since both enums have the same values, we can safely cast
    return status as unknown as PipelineStage;
  }

  private async calculateConversionRates(): Promise<void> {
    try {
      const stages = await this.pipelineModel.find().sort({ stage: 1 }).exec();

      for (let i = 0; i < stages.length - 1; i++) {
        const currentStage = stages[i];
        const nextStage = stages[i + 1];

        // Calculate conversion rate, defaulting to 0 if division by zero would occur
        const conversionRate = currentStage.count > 0
          ? Math.round((nextStage.count / currentStage.count) * 100)
          : 0;

        // Ensure we never store NaN or undefined values
        const safeConversionRate = isNaN(conversionRate) ? 0 : conversionRate;

        await this.pipelineModel.updateOne(
          { _id: currentStage._id },
          { conversionRate: safeConversionRate }
        );
      }
    } catch (error) {
      console.error('Failed to calculate conversion rates:', error);
      throw error;
    }
  }

  private async seedPipelines() {
    // Initialize all pipeline stages
    for (const stage of Object.values(PipelineStage)) {
      await this.pipelineModel.findOneAndUpdate(
        { stage },
        {
          stage,
          count: 0,
          value: 0,
          conversionRate: 0,
          metrics: {
            averageDealSize: 0,
            averageTimeInStage: 0,
            winRate: stage === PipelineStage.CLOSED_WON ? 100 : 0,
            lossRate: stage === PipelineStage.CLOSED_LOST ? 100 : 0
          },
          lastUpdated: new Date()
        },
        { upsert: true }
      );
    }
  }

  private async seedCampaigns() {
    const campaigns = [
      {
        name: 'Summer Sale 2024',
        description: 'Annual summer promotion campaign',
        type: CampaignType.EMAIL,
        status: CampaignStatus.ACTIVE,
        targetSegments: ['high-value', 'active-customers'],
        content: {
          subject: 'Summer Special Offer',
          body: 'Get 20% off on all products this summer!',
          callToAction: {
            text: 'Shop Now',
            url: 'https://example.com/summer-sale',
          },
        },
        schedule: {
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          timezone: 'UTC',
        },
      },
    ];
    await this.campaignModel.insertMany(campaigns);
  }

  private async seedCustomerSegments() {
    const segments = [
      {
        name: 'High-Value Customers',
        description: 'Customers with lifetime value > $10,000',
        type: SegmentType.BEHAVIORAL,
        customerIds: [],
        criteria: {
          behavior: {
            purchaseHistory: ['premium-products'],
            engagementLevel: 'high',
          },
        },
      },
    ];
    await this.customerSegmentModel.insertMany(segments);
  }

  private async seedSupportTickets() {
    const tickets = [
      {
        userId: 'user123',
        title: 'Product Inquiry',
        description: 'Need information about enterprise features',
        status: SupportTicketStatus.OPEN,
        type: 'product',
        priority: SupportTicketPriority.MEDIUM,
        category: SupportTicketCategory.GENERAL,
      },
    ];
    await this.supportTicketModel.insertMany(tickets);
  }

  private async seedAuditLogs() {
    const logs = [
      {
        userId: 'user123',
        userEmail: 'user@example.com',
        action: AuditAction.LOGIN,
        entityType: 'user',
        entityId: 'user123',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
    ];
    await this.auditLogModel.insertMany(logs);
  }

  private async seedInteractions() {
    const interactions = [
      {
        userId: 'user123',
        type: InteractionType.EMAIL,
        description: 'Sent welcome email',
        metadata: {
          entityId: 'campaign123',
          entityType: 'campaign',
        },
      },
    ];
    await this.interactionModel.insertMany(interactions);
  }

  private async seedPerformance() {
    // Get the sales rep user
    const salesRep = await this.userModel.findOne({ role: UserRole.SALES_REP });
    if (!salesRep) {
      throw new Error('Sales rep user not found');
    }

    const performances = [
      {
        salesRepId: salesRep._id, // Use the actual ObjectId
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-31'),
        totalLeads: 50,
        qualifiedLeads: 30,
        conversionRate: 60,
        totalValue: 150000,
        averageDealSize: 5000,
        closedWon: 18,
        closedLost: 12,
      },
    ];
    await this.performanceModel.insertMany(performances);
  }

  private async seedSentimentAnalysis() {
    const analyses = [
      {
        content: 'Great product, very satisfied with the service!',
        source: SentimentSource.CUSTOMER_FEEDBACK,
        sentiment: 'positive',
        score: 0.9,
        keywords: ['great', 'satisfied', 'service'],
      },
    ];
    await this.sentimentAnalysisModel.insertMany(analyses);
  }

  private async seedDataAnalystReports() {
    const reports = [
      {
        type: DataAnalystReportType.CUSTOMER_ANALYTICS,
        visualization: 'bar',
        drillDownLevel: 0,
        parameters: {
          metrics: ['revenue', 'engagement'],
          filters: { dateRange: 'last30days' },
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];
    await this.dataAnalystReportModel.insertMany(reports);
  }

  private async seedSalesManagerForecasts() {
    const metrics = ['revenue', 'leads', 'conversion'];
    const forecasts = [];
    const now = new Date();

    // Generate 12 months of historical data
    for (let i = 12; i >= 0; i--) {
      const timestamp = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const predictionDate = new Date(timestamp);
      predictionDate.setMonth(predictionDate.getMonth() + 1);
      const month = timestamp.getMonth();

      for (const metric of metrics) {
        // Generate base values with some randomness and seasonality
        let baseValue;
        let actualValue;

        switch (metric) {
          case 'revenue':
            baseValue = 800000 + Math.random() * 400000; // $800k-$1.2M base
            // Add seasonality (higher in Q4)
            if (month >= 9 && month <= 11) { // Q4
              baseValue *= 1.3;
            } else if (month >= 0 && month <= 2) { // Q1
              baseValue *= 0.9;
            }
            actualValue = baseValue * (0.9 + Math.random() * 0.2); // 90-110% of predicted
            break;

          case 'leads':
            baseValue = 500 + Math.random() * 200; // 500-700 leads base
            // Add seasonality (higher in Q2)
            if (month >= 3 && month <= 5) { // Q2
              baseValue *= 1.2;
            }
            actualValue = baseValue * (0.85 + Math.random() * 0.3); // 85-115% of predicted
            break;

          case 'conversion':
            baseValue = 0.15 + Math.random() * 0.1; // 15-25% base conversion
            // Add seasonality (higher in Q3)
            if (month >= 6 && month <= 8) { // Q3
              baseValue *= 1.1;
            }
            actualValue = baseValue * (0.9 + Math.random() * 0.2); // 90-110% of predicted
            break;
        }

        // Calculate confidence based on historical accuracy
        const confidence = 0.7 + Math.random() * 0.2; // 70-90% confidence

        // Calculate factors with some correlation to actual performance
        const historicalTrend = 0.6 + Math.random() * 0.3;
        const seasonality = 0.7 + Math.random() * 0.2;
        const marketConditions = 0.65 + Math.random() * 0.25;
        const teamPerformance = 0.7 + Math.random() * 0.2;

        // Calculate accuracy for past predictions
        const accuracy = i < 12 ?
          (1 - Math.abs(baseValue - actualValue) / actualValue) :
          null;

        forecasts.push({
          metric,
          predictedValue: Math.round(baseValue),
          actualValue: i < 12 ? Math.round(actualValue) : undefined,
          confidence,
          factors: {
            historicalTrend,
            seasonality,
            marketConditions,
            teamPerformance
          },
          timestamp,
          predictionDate,
          date: timestamp,
          value: Math.round(baseValue),
          accuracy: accuracy || 0.85,
          metadata: {
            model: 'seasonal_arima',
            version: '1.0.0',
            parameters: {
              seasonality: true,
              trend: true
            }
          }
        });
      }
    }

    await this.salesManagerForecastModel.insertMany(forecasts);
  }

  private async seedCampaignAnalytics() {
    const analytics = [
      {
        campaignId: 'campaign123',
        campaignType: CampaignType.EMAIL,
        metrics: {
          reach: {
            total: 10000,
            unique: 8000,
          },
          engagement: {
            impressions: 10000,
            clicks: 2000,
            clickThroughRate: 0.2,
            timeSpent: 120,
            bounceRate: 0.1,
          },
          conversion: {
            total: 500,
            rate: 0.05,
            revenue: 50000,
            costPerConversion: 10,
          },
        },
      },
    ];
    await this.campaignAnalyticsModel.insertMany(analytics);
  }

  private async seedRecommendations() {
    const recommendations = [
      {
        userId: 'user123',
        content: 'Based on your purchase history, you might be interested in our premium package',
        type: 'product',
        metadata: {
          confidence: 0.85,
          source: 'purchase-history',
        },
      },
    ];
    await this.recommendationModel.insertMany(recommendations);
  }

  private async seedDashboardConfigs() {
    const configs = [
      {
        id: 'dashboard1',
        name: 'Sales Overview',
        metrics: ['revenue', 'leads', 'conversion'],
        layout: 'grid',
        refreshInterval: 300,
        isDefault: true,
        userId: 'user123',
      },
    ];
    await this.dashboardConfigModel.insertMany(configs);
  }

  private async seedSalesReports() {
    const reports = [
      {
        type: SalesReportType.MONTHLY,
        format: SalesReportFormat.PDF,
        name: 'January 2024 Sales Report',
        description: 'Monthly sales performance report',
        parameters: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          metrics: ['revenue', 'leads', 'conversion'],
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];
    await this.salesReportModel.insertMany(reports);
  }
}