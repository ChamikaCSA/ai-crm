import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { ChatbotMessageDto, ChatbotResponseDto } from './dto/chatbot-message.dto';
import { RecommendationDto } from './dto/recommendations.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('account')
  async getAccountDetails(@Req() req: AuthenticatedRequest) {
    return this.customerService.getAccountDetails(req.user.userId);
  }

  @Get('recommendation')
  async getRecommendations(@Req() req: AuthenticatedRequest): Promise<RecommendationDto[]> {
    return this.customerService.getRecommendations(req.user.userId);
  }

  @Post('support-ticket')
  createSupportTicket(@Req() req: AuthenticatedRequest, @Body() createSupportTicketDto: CreateSupportTicketDto) {
    const userId = req.user.userId;
    return this.customerService.createSupportTicket(userId, createSupportTicketDto);
  }

  @Get('support-ticket')
  findAllSupportTickets(@Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.customerService.findAllSupportTickets(userId);
  }

  @Get('support-ticket/:id')
  async findOneSupportTicket(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    try {
      return await this.customerService.findOneSupportTicket(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Patch('support-ticket/:id')
  async updateSupportTicket(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateSupportTicketDto: UpdateSupportTicketDto,
  ) {
    const userId = req.user.userId;
    try {
      return await this.customerService.updateSupportTicket(id, userId, updateSupportTicketDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('chatbot/message')
  async handleChatbotMessage(
    @Req() req: AuthenticatedRequest,
    @Body() messageDto: ChatbotMessageDto,
  ): Promise<ChatbotResponseDto> {
    return this.customerService.handleChatbotMessage(req.user.userId, messageDto.message);
  }
}