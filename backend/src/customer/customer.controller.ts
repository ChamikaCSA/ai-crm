import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, NotFoundException, UseInterceptors, UploadedFiles, Res, Request } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { Response } from 'express';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { ChatbotMessageDto, ChatbotResponseDto } from './dto/chatbot-message.dto';
import { RecommendationDto } from './dto/recommendations.dto';
import { TicketReplyDto } from './dto/ticket-reply.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { InteractionType } from './schemas/interaction.schema';
import { CreateCustomerLeadDto } from './dto/create-customer-lead.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Lead } from '../sales-rep/schemas/lead.schema';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

interface RequestWithUser extends Request {
  user: {
    sub: string;
    [key: string]: any;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('recommendation')
  async getRecommendations(@Req() req: AuthenticatedRequest): Promise<RecommendationDto[]> {
    return this.customerService.getRecommendations(req.user.sub);
  }

  @Post('support-ticket')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'attachments', maxCount: 5 }
  ]))
  async createSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Body() createSupportTicketDto: CreateSupportTicketDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }
  ) {

    const userId = req.user.sub
    try {
      const attachments = files?.attachments?.map(file => ({
        name: file.originalname,
        url: file.path
      })) || []

      const result = await this.customerService.createSupportTicket(userId, {
        ...createSupportTicketDto,
        attachments
      })
      return result
    } catch (error) {
      console.error('Backend Controller - Error details:', error)
      throw error
    }
  }

  @Get('support-ticket')
  findAllSupportTickets(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.customerService.findAllSupportTickets(userId);
  }

  @Get('support-ticket/:id')
  async findOneSupportTicket(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
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
    const userId = req.user.sub;
    try {
      return await this.customerService.updateSupportTicket(id, userId, updateSupportTicketDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('support-ticket/:id/close')
  async closeSupportTicket(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;
    try {
      return await this.customerService.closeSupportTicket(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('chatbot')
  async handleChatbotMessage(
    @Req() req: AuthenticatedRequest,
    @Body() messageDto: ChatbotMessageDto,
  ): Promise<ChatbotResponseDto> {
    return this.customerService.handleChatbotMessage(
      req.user.sub,
      messageDto.message,
      messageDto.chatHistory
    );
  }

  @Post('support-ticket/:id/reply')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'attachments', maxCount: 5 }
  ]))
  async addTicketReply(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() replyDto: TicketReplyDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }
  ) {

    const userId = req.user.sub
    try {
      const attachments = files?.attachments?.map(file => {
        return {
          name: file.originalname,
          url: file.path
        }
      }) || []


      const result = await this.customerService.addTicketReply(id, userId, {
        ...replyDto,
        attachments
      })
      return result
    } catch (error) {
      console.error('Backend Controller - Error details:', error)
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }

  @Get('support-ticket/attachment/:filename')
  async getAttachment(
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    try {
      const filePath = join(process.cwd(), 'uploads', filename);
      res.setHeader('Content-Disposition', `attachment; filename="${filename.split('-').pop()}"`);
      return res.sendFile(filePath);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  @Post('interaction')
  async trackInteraction(
    @Req() req: RequestWithUser,
    @Body() body: {
      type: InteractionType;
      description: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.customerService.trackInteraction(
      req.user.sub,
      body.type,
      body.description,
      body.metadata,
    );
  }

  @Post('lead')
  @ApiOperation({ summary: 'Create a new lead as a customer' })
  @ApiResponse({ status: 201, description: 'Lead created successfully', type: Lead })
  @UseGuards(JwtAuthGuard)
  async createLead(
    @Body() createCustomerLeadDto: CreateCustomerLeadDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Lead> {
    return this.customerService.createLead(createCustomerLeadDto, req.user.sub);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get all leads for the authenticated customer' })
  @ApiResponse({ status: 200, description: 'Returns all leads for the customer', type: [Lead] })
  @UseGuards(JwtAuthGuard)
  async getCustomerLeads(@Request() req: AuthenticatedRequest): Promise<Lead[]> {
    return this.customerService.getCustomerLeads(req.user.sub);
  }
}