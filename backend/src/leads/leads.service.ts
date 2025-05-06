import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadStatus } from './schemas/lead.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = new this.leadModel(createLeadDto);
    lead.leadScore = await this.calculateLeadScore(lead);
    return lead.save();
  }

  async findAll(): Promise<Lead[]> {
    return this.leadModel.find().exec();
  }

  async findOne(id: string): Promise<Lead> {
    return this.leadModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<Lead>): Promise<Lead> {
    const lead = await this.leadModel.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Update lead data
    Object.assign(lead, updateData);

    // Recalculate lead score if relevant fields are updated
    if (this.shouldRecalculateScore(updateData)) {
      lead.leadScore = await this.calculateLeadScore(lead);
    }

    return lead.save();
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.leadModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  private async calculateLeadScore(lead: Lead): Promise<number> {
    let score = 0;

    // Company information
    if (lead.company) score += 10;
    if (lead.jobTitle) score += 5;

    // Contact information completeness
    if (lead.email) score += 10;
    if (lead.phone) score += 10;

    // Source scoring
    switch (lead.source) {
      case 'referral':
        score += 20;
        break;
      case 'website':
        score += 15;
        break;
      case 'email':
        score += 10;
        break;
      case 'social_media':
        score += 8;
        break;
      case 'phone':
        score += 5;
        break;
    }

    // Interaction scoring
    if (lead.interactions && lead.interactions.length > 0) {
      score += Math.min(lead.interactions.length * 5, 25);
    }

    // Purchase history scoring
    if (lead.purchaseHistory) {
      if (lead.purchaseHistory.totalValue > 0) {
        score += Math.min(lead.purchaseHistory.totalValue / 1000, 30);
      }
      if (lead.purchaseHistory.products.length > 0) {
        score += Math.min(lead.purchaseHistory.products.length * 5, 20);
      }
    }

    // Normalize score to 0-100 range
    return Math.min(Math.max(score, 0), 100);
  }

  private shouldRecalculateScore(updateData: Partial<Lead>): boolean {
    const relevantFields = [
      'company',
      'jobTitle',
      'email',
      'phone',
      'source',
      'interactions',
      'purchaseHistory'
    ];
    return relevantFields.some(field => field in updateData);
  }

  async delete(id: string): Promise<void> {
    const result = await this.leadModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error('Lead not found');
    }
  }
}