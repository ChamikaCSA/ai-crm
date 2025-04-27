import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Interaction, InteractionDocument } from './schemas/interaction.schema';
import { SupportTicket, SupportTicketDocument } from './schemas/support-ticket.schema';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { RecommendationDto } from './dto/recommendations.dto';
import { ChatbotResponseDto } from './dto/chatbot-message.dto';
import { TicketReplyDto } from './dto/ticket-reply.dto';
import { aiService } from '../ai/ai.service';
import { SupportTicketStatus } from './schemas/support-ticket.schema';
import { InteractionType } from './schemas/interaction.schema';

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
    const interactions = await this.interactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    return interactions.map(interaction => ({
      type: interaction.type,
      description: interaction.description,
      timestamp: interaction.createdAt.toISOString(),
      metadata: interaction.metadata
    }));
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

  async trackInteraction(
    userId: string,
    type: InteractionType,
    description: string,
    metadata: any = {}
  ) {
    const interaction = new this.interactionModel({
      userId,
      type,
      description,
      metadata,
      createdAt: new Date(),
    });
    return interaction.save();
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
      author: userId,
      message: replyDto.message,
      timestamp: new Date(),
      attachments: replyDto.attachments || [],
    }

    supportTicket.replies.push(reply)
    const savedTicket = await supportTicket.save()

    return savedTicket
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

    return {
      response,
      sessionId: `chat_${userId}`,
    };
  }

  private async getConversationHistory(userId: string) {
    // TODO: Implement conversation history retrieval
    return [];
  }
}