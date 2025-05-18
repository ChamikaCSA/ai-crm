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

@Injectable()
export class SalesRepService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private readonly emailService: EmailService,
    private readonly aiService: aiService,
  ) {}

  async getStats(userId: string) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get active leads (leads with status 'contacted', 'qualified', or 'proposal')
    const activeLeads = await this.leadModel.countDocuments({
      assignedTo: userId,
      status: { $in: ['contacted', 'qualified', 'proposal'] }
    });

    // Get leads from last week
    const lastWeekLeads = await this.leadModel.countDocuments({
      assignedTo: userId,
      createdAt: { $gte: lastWeek }
    });

    // Calculate conversion rate (qualified + proposal leads / total leads)
    const [qualifiedLeads, totalLeads] = await Promise.all([
      this.leadModel.countDocuments({
        assignedTo: userId,
        status: { $in: ['qualified', 'proposal'] }
      }),
      this.leadModel.countDocuments({ assignedTo: userId })
    ]);

    const conversionRate = totalLeads > 0
      ? Math.round((qualifiedLeads / totalLeads) * 100)
      : 0;

    // Get last month's conversion rate for comparison
    const lastMonthQualifiedLeads = await this.leadModel.countDocuments({
      assignedTo: userId,
      status: { $in: ['qualified', 'proposal'] },
      createdAt: { $gte: lastMonth }
    });

    const lastMonthTotalLeads = await this.leadModel.countDocuments({
      assignedTo: userId,
      createdAt: { $gte: lastMonth }
    });

    const lastMonthConversionRate = lastMonthTotalLeads > 0
      ? Math.round((lastMonthQualifiedLeads / lastMonthTotalLeads) * 100)
      : 0;

    return {
      activeLeads,
      lastWeekLeads,
      conversionRate,
      lastMonthConversionRate
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
      return createdLead.save();
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
    return updatedLead;
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
        .sort({ value: -1 })
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