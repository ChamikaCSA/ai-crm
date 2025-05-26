import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadStatus } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadSource } from './schemas/lead.schema';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { EmailService } from '../common/services/email.service';
import { aiService } from '../ai/ai.service';
import { Pipeline, PipelineStage } from '../sales-manager/schemas/pipeline.schema';

@Injectable()
export class SalesRepService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    @InjectModel(Pipeline.name) private pipelineModel: Model<Pipeline>,
    private readonly emailService: EmailService,
    private readonly aiService: aiService,
  ) {}

  async getStats(userId: string) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get active leads (leads with status 'contacted', 'qualified', 'proposal', or 'negotiation')
    const activeLeads = await this.leadModel.countDocuments({
      assignedTo: userId,
      status: { $in: ['contacted', 'qualified', 'proposal', 'negotiation'] }
    });

    // Get leads from last week
    const lastWeekLeads = await this.leadModel.countDocuments({
      assignedTo: userId,
      createdAt: { $gte: lastWeek }
    });

    // Calculate weighted conversion rate based on all lead statuses
    const [leadCounts, totalLeads] = await Promise.all([
      this.leadModel.aggregate([
        {
          $match: { assignedTo: userId }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      this.leadModel.countDocuments({ assignedTo: userId })
    ]);

    // Define status weights (higher weight means better conversion)
    const statusWeights = {
      'new': 0,
      'contacted': 0.2,
      'qualified': 0.4,
      'proposal': 0.6,
      'negotiation': 0.8,
      'closed_won': 1,
      'closed_lost': 0
    };

    // Calculate weighted conversion rate
    let weightedSum = 0;
    leadCounts.forEach(({ _id, count }) => {
      weightedSum += (statusWeights[_id] || 0) * count;
    });

    const conversionRate = totalLeads > 0
      ? Math.round((weightedSum / totalLeads) * 100)
      : 0;

    // Calculate last month's conversion rate for comparison
    const [lastMonthLeadCounts, lastMonthTotalLeads] = await Promise.all([
      this.leadModel.aggregate([
        {
          $match: {
            assignedTo: userId,
            createdAt: { $gte: lastMonth }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      this.leadModel.countDocuments({
        assignedTo: userId,
        createdAt: { $gte: lastMonth }
      })
    ]);

    let lastMonthWeightedSum = 0;
    lastMonthLeadCounts.forEach(({ _id, count }) => {
      lastMonthWeightedSum += (statusWeights[_id] || 0) * count;
    });

    const lastMonthConversionRate = lastMonthTotalLeads > 0
      ? Math.round((lastMonthWeightedSum / lastMonthTotalLeads) * 100)
      : 0;

    return {
      activeLeads,
      lastWeekLeads,
      conversionRate,
      lastMonthConversionRate,
      leadStatusBreakdown: leadCounts.reduce((acc, { _id, count }) => ({
        ...acc,
        [_id]: count
      }), {})
    };
  }

  async getLeads(userId: string) {
    return this.leadModel
      .find({ assignedTo: userId })
      .sort({ lastContact: -1 })
      .limit(5)
      .exec();
  }

  async createLead(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      // Get AI-powered lead score and insights
      const { leadScore, aiInsights } = await this.aiService.generateLeadScore(createLeadDto);

      const createdLead = new this.leadModel({
        ...createLeadDto,
        leadScore,
        aiInsights
      });

      const savedLead = await createdLead.save();

      // Update pipeline metrics for new lead
      await this.updatePipelineMetrics(savedLead);

      return savedLead;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  async getLead(id: string): Promise<Lead> {
    const lead = await this.leadModel.findById(id).exec();
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async updateLead(id: string, updateData: Partial<Lead>): Promise<Lead> {
    const updatedLead = await this.leadModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedLead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return updatedLead;
  }

  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    const updatedLead = await this.leadModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!updatedLead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Update pipeline metrics when lead status changes
    await this.updatePipelineMetrics(updatedLead);

    return updatedLead;
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

  async deleteLead(id: string): Promise<void> {
    const result = await this.leadModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }

  async getPerformanceData(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'this_week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'this_month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'this_quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'this_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalLeads, qualifiedLeads, topLeads] = await Promise.all([
      this.leadModel.countDocuments({ createdAt: { $gte: startDate } }),
      this.leadModel.countDocuments({
        status: { $in: ['qualified', 'proposal'] },
        createdAt: { $gte: startDate }
      }),
      this.leadModel
        .find({ createdAt: { $gte: startDate } })
        .sort({ leadScore: -1 })
        .limit(5)
        .exec()
    ]);

    const conversionRate = totalLeads > 0
      ? Math.round((qualifiedLeads / totalLeads) * 100)
      : 0;

    return {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      topLeads
    };
  }

  async sendEmail(leadId: string, sendEmailDto: SendEmailDto): Promise<void> {
    const lead = await this.leadModel.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Send the email using the email service
    await this.emailService.sendEmail({
      to: sendEmailDto.recipient,
      subject: sendEmailDto.subject,
      text: sendEmailDto.body,
    });

    // Add the email interaction to the lead's channel history
    lead.channelHistory.push({
      channel: LeadSource.EMAIL,
      timestamp: new Date(),
      interactionType: 'EMAIL_SENT',
      notes: `Email sent: ${sendEmailDto.subject}`,
    });

    await lead.save();
  }
}