import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { SupportTicket, SupportTicketDocument } from './schemas/support-ticket.schema';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { RecommendationDto } from './dto/recommendations.dto';
import { ChatbotResponseDto } from './dto/chatbot-message.dto';
import { TicketReplyDto } from './dto/ticket-reply.dto';
import { aiService } from '../ai/ai.service';
import { SupportTicketStatus } from './schemas/support-ticket.schema';
import { Lead } from '../sales-rep/schemas/lead.schema';
import { CreateCustomerLeadDto } from './dto/create-customer-lead.dto';
import { LeadSource, LeadStatus } from '../sales-rep/schemas/lead.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicketDocument>,
    private aiService: aiService,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
    private userService: UserService,
  ) {}

  // Recommendation related methods
  async getRecommendations(userId: string): Promise<RecommendationDto[]> {
    try {
      // Get user's profile and preferences
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get user's recent interactions
      const recentInteractions = await this.userService.getRecentInteractions(userId);

      // Get user's support tickets for additional context
      const supportTickets = await this.supportTicketModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();

      // Get user's leads for additional context
      const leads = await this.leadModel
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();

      // Prepare user context
      const userContext = {
        user,
        usersLeads: leads,
        supportHistory: supportTickets,
      };

      // Use OpenAI to generate personalized recommendations with enhanced context
      const recommendations = await this.aiService.generateRecommendations(
        recentInteractions,
        userContext
      );

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Support Ticket related methods
  async createSupportTicket(userId: string, createSupportTicketDto: CreateSupportTicketDto) {
    const supportTicket = new this.supportTicketModel({
      ...createSupportTicketDto,
      userId,
      status: SupportTicketStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedTicket = await supportTicket.save();

    return savedTicket;
  }

  async findAllSupportTickets(userId: string) {
    return this.supportTicketModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOneSupportTicket(id: string, userId: string) {
    const supportTicket = await this.supportTicketModel.findOne({ _id: id, userId }).exec();
    if (!supportTicket) {
      throw new NotFoundException('Support ticket not found');
    }
    return supportTicket;
  }

  async updateSupportTicket(
    userId: string,
    ticketId: string,
    updateSupportTicketDto: UpdateSupportTicketDto,
  ) {
    const supportTicket = await this.supportTicketModel.findOne({ _id: ticketId, userId }).exec();
    if (!supportTicket) {
      throw new NotFoundException('Support ticket not found');
    }

    // Prevent updating status and resolution through this endpoint
    const { status, resolution, ...updateData } = updateSupportTicketDto;

    Object.assign(supportTicket, updateData);
    const updatedTicket = await supportTicket.save();

    return updatedTicket;
  }

  async closeSupportTicket(id: string, userId: string) {
    const supportTicket = await this.supportTicketModel.findOne({ _id: id, userId }).exec();
    if (!supportTicket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (supportTicket.status === SupportTicketStatus.CLOSED) {
      throw new BadRequestException('Support ticket is already closed');
    }

    supportTicket.status = SupportTicketStatus.CLOSED;
    supportTicket.updatedAt = new Date();
    return supportTicket.save();
  }

  async addTicketReply(id: string, userId: string, replyDto: TicketReplyDto) {

    const supportTicket = await this.supportTicketModel.findOne({ _id: id, userId }).exec()
    if (!supportTicket) {
      throw new NotFoundException('Support ticket not found')
    }

    const reply = {
      userId: userId,
      content: replyDto.message,
      createdAt: new Date()
    }

    supportTicket.replies.push(reply)
    const savedTicket = await supportTicket.save()

    return savedTicket
  }

  // Chatbot related methods
  async handleChatbotMessage(userId: string, message: string, chatHistory?: { role: string; content: string }[]): Promise<ChatbotResponseDto> {
    try {
      // Get user's profile and preferences
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get user's recent interactions
      const recentInteractions = await this.userService.getRecentInteractions(userId);

      // Get user's support tickets for additional context
      const supportTickets = await this.supportTicketModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();

      // Get user's leads for additional context
      const leads = await this.leadModel
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();

      // Prepare user context
      const userContext = {
        user,
        usersLeads: leads,
        supportHistory: supportTickets,
      };

      // Use OpenAI to generate response with user context and chat history
      const aiResponse = await this.aiService.generateChatResponse(
        message,
        userContext,
        chatHistory
      );

      return {
        response: aiResponse.response,
        sessionId: `chat_${userId}`,
        metadata: aiResponse.metadata
      };
    } catch (error) {
      console.error('Error handling chatbot message:', error);
      throw error;
    }
  }

  async createLead(createCustomerLeadDto: CreateCustomerLeadDto, userId?: string): Promise<Lead> {
    try {
      // Get AI-powered lead score and insights
      const { leadScore, aiInsights } = await this.aiService.generateLeadScore({
        ...createCustomerLeadDto,
        source: LeadSource.WEBSITE
      });

      const lead = new this.leadModel({
        ...createCustomerLeadDto,
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        user: userId,
        leadScore,
        aiInsights
      });
      return lead.save();
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  async getCustomerLeads(userId: string): Promise<Lead[]> {
    return this.leadModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}