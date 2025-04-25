import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Interaction, InteractionDocument } from './schemas/interaction.schema';
import { SupportTicket, SupportTicketDocument } from './schemas/support-ticket.schema';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { RecommendationDto } from './dto/recommendations.dto';
import { ChatbotResponseDto } from './dto/chatbot-message.dto';
import { aiService } from '../ai/ai.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Interaction.name) private interactionModel: Model<InteractionDocument>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicketDocument>,
    private aiService: aiService,
  ) {}

  // Account related methods
  async getAccountDetails(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');

    // Get additional account information
    const accountInfo = {
      user,
      recentInteractions: await this.getRecentInteractions(userId),
      accountStatus: await this.getAccountStatus(userId),
    };

    return accountInfo;
  }

  private async getRecentInteractions(userId: string) {
    // Mock recent interactions for testing
    return [
      {
        type: 'Chat Support',
        description: 'Discussed premium features and pricing options',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        type: 'Email Support',
        description: 'Received response regarding API integration',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        type: 'System',
        description: 'Account settings updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        type: 'Support Ticket',
        description: 'Created new support ticket #1234',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
      }
    ];
  }

  private async getAccountStatus(userId: string) {
    // Implementation for getting account status
    return {
      status: 'active',
      lastLogin: new Date(),
      subscriptionStatus: 'active',
    };
  }

  // Recommendation related methods
  async getRecommendations(userId: string): Promise<RecommendationDto[]> {
    // Get user's recent interactions
    const recentInteractions = await this.interactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    // Use OpenAI to generate personalized recommendations
    const recommendations = await this.aiService.generateRecommendations(
      recentInteractions,
    );

    return recommendations;
  }

  async trackInteraction(userId: string, type: string, data: any) {
    const interaction = new this.interactionModel({
      userId,
      type,
      data,
      createdAt: new Date(),
    });
    return interaction.save();
  }

  // Support Ticket related methods
  async createSupportTicket(userId: string, createSupportTicketDto: CreateSupportTicketDto) {
    const supportTicket = new this.supportTicketModel({
      ...createSupportTicketDto,
      userId,
      status: 'open',
      createdAt: new Date(),
    });
    return supportTicket.save();
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

  async updateSupportTicket(id: string, userId: string, updateSupportTicketDto: UpdateSupportTicketDto) {
    const supportTicket = await this.supportTicketModel.findOne({ _id: id, userId }).exec();
    if (!supportTicket) {
      throw new NotFoundException('Support ticket not found');
    }

    // Prevent updating status and resolution through this endpoint
    const { status, resolution, ...updateData } = updateSupportTicketDto;

    Object.assign(supportTicket, updateData);
    return supportTicket.save();
  }

  // Chatbot related methods
  async handleChatbotMessage(userId: string, message: string): Promise<ChatbotResponseDto> {
    // Get conversation history for context
    const conversationHistory = await this.getConversationHistory(userId);

    // Use OpenAI to generate response
    const response = await this.aiService.generateChatResponse(
      message,
      userId,
      `chat_${userId}`,
    );

    // Save the interaction
    await this.saveInteraction(userId, message, response);

    return {
      response,
      sessionId: `chat_${userId}`,
    };
  }

  private async getConversationHistory(userId: string) {
    // TODO: Implement conversation history retrieval
    return [];
  }

  private async saveInteraction(userId: string, message: string, response: string) {
    // TODO: Implement interaction saving
  }
}