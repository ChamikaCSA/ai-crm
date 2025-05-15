import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from '../leads/schemas/lead.schema';
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfDay } from 'date-fns';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<Lead>,
  ) {}

  async getPerformanceData(period: string) {
    // Temporary mock data
    return {
      metrics: [
        {
          title: 'Total Sales',
          value: '$1,250,000',
          change: 15.5,
        },
        {
          title: 'Active Leads',
          value: '45',
          change: 8.2,
        },
        {
          title: 'Conversion Rate',
          value: '32.5%',
          change: -2.1,
        },
        {
          title: 'Avg. Deal Size',
          value: '$85,000',
          change: 12.3,
        },
      ],
      topLeads: [
        {
          id: '1',
          name: 'John Smith',
          company: 'TechCorp Inc.',
          value: 250000,
          status: 'hot',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          company: 'Global Solutions Ltd',
          value: 180000,
          status: 'warm',
        },
        {
          id: '3',
          name: 'Michael Chen',
          company: 'Innovate Systems',
          value: 150000,
          status: 'hot',
        },
      ],
    };

    // Real implementation (commented out for now)
    /*
    const dateRange = this.getDateRange(period);
    const [metrics, topLeads] = await Promise.all([
      this.calculateMetrics(dateRange),
      this.getTopLeads(),
    ]);

    return {
      metrics,
      topLeads,
    };
    */
  }

  private getDateRange(period: string): { start: Date; end: Date } {
    const end = endOfDay(new Date());
    let start: Date;

    switch (period) {
      case 'this_week':
        start = startOfWeek(end);
        break;
      case 'this_month':
        start = startOfMonth(end);
        break;
      case 'this_quarter':
        start = startOfQuarter(end);
        break;
      case 'this_year':
        start = startOfYear(end);
        break;
      default:
        start = startOfMonth(end);
    }

    return { start, end };
  }

  private async calculateMetrics(dateRange: { start: Date; end: Date }) {
    const { start, end } = dateRange;
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

    // Current period metrics
    const currentPeriodLeads = await this.leadModel.find({
      createdAt: { $gte: start, $lte: end },
    });

    // Previous period metrics for comparison
    const previousPeriodLeads = await this.leadModel.find({
      createdAt: { $gte: previousPeriodStart, $lt: start },
    });

    // Calculate total sales
    const currentSales = currentPeriodLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const previousSales = previousPeriodLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const salesChange = previousSales ? ((currentSales - previousSales) / previousSales) * 100 : 0;

    // Calculate active leads
    const activeLeads = await this.leadModel.countDocuments({
      status: { $in: ['qualified', 'proposal', 'negotiation'] },
      updatedAt: { $gte: start, $lte: end },
    });
    const previousActiveLeads = await this.leadModel.countDocuments({
      status: { $in: ['qualified', 'proposal', 'negotiation'] },
      updatedAt: { $gte: previousPeriodStart, $lt: start },
    });
    const activeLeadsChange = previousActiveLeads ? ((activeLeads - previousActiveLeads) / previousActiveLeads) * 100 : 0;

    // Calculate conversion rate
    const closedWonLeads = currentPeriodLeads.filter(lead => lead.status === 'closed_won').length;
    const conversionRate = currentPeriodLeads.length ? (closedWonLeads / currentPeriodLeads.length) * 100 : 0;
    const previousClosedWonLeads = previousPeriodLeads.filter(lead => lead.status === 'closed_won').length;
    const previousConversionRate = previousPeriodLeads.length ? (previousClosedWonLeads / previousPeriodLeads.length) * 100 : 0;
    const conversionChange = previousConversionRate ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 : 0;

    // Calculate average deal size
    const avgDealSize = closedWonLeads ? currentSales / closedWonLeads : 0;
    const previousAvgDealSize = previousClosedWonLeads ? previousSales / previousClosedWonLeads : 0;
    const avgDealSizeChange = previousAvgDealSize ? ((avgDealSize - previousAvgDealSize) / previousAvgDealSize) * 100 : 0;

    return [
      {
        title: 'Total Sales',
        value: `$${currentSales.toLocaleString()}`,
        change: Number(salesChange.toFixed(1)),
      },
      {
        title: 'Active Leads',
        value: activeLeads.toString(),
        change: Number(activeLeadsChange.toFixed(1)),
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: Number(conversionChange.toFixed(1)),
      },
      {
        title: 'Avg. Deal Size',
        value: `$${avgDealSize.toLocaleString()}`,
        change: Number(avgDealSizeChange.toFixed(1)),
      },
    ];
  }

  private async getTopLeads() {
    const leads = await this.leadModel
      .find({
        status: { $in: ['qualified', 'proposal', 'negotiation'] },
      })
      .sort({ value: -1 })
      .limit(3);

    return leads.map(lead => ({
      id: lead._id.toString(),
      name: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      value: lead.value,
      status: this.calculateLeadTemperature(lead),
    }));
  }

  private calculateLeadTemperature(lead: Lead): 'hot' | 'warm' | 'cold' {
    // Calculate lead temperature based on various factors
    let score = 0;

    // Factor 1: Deal value
    if (lead.value >= 100000) score += 3;
    else if (lead.value >= 50000) score += 2;
    else if (lead.value >= 10000) score += 1;

    // Factor 2: Lead status
    const statusScores = {
      negotiation: 3,
      proposal: 2,
      qualified: 1,
    };
    score += statusScores[lead.status] || 0;

    // Factor 3: Recent activity (within last 7 days)
    const lastUpdated = new Date(lead.updatedAt).getTime();
    const now = new Date().getTime();
    const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate <= 7) score += 2;
    else if (daysSinceUpdate <= 14) score += 1;

    // Determine temperature based on total score
    if (score >= 6) return 'hot';
    if (score >= 3) return 'warm';
    return 'cold';
  }
}