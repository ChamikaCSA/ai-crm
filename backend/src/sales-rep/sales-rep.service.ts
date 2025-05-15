import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../leads/schemas/lead.schema';

@Injectable()
export class SalesRepService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
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
}