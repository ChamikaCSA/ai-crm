import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Delete, Query } from '@nestjs/common';
import { SalesRepService } from './sales-rep.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { PerformanceQueryDto } from './dto/performance-query.dto';
import { Lead } from './schemas/lead.schema';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('Sales Representative')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALES_REP)
@Controller('api/sales-rep')
export class SalesRepController {
  constructor(private readonly salesRepService: SalesRepService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get sales representative statistics' })
  @ApiResponse({ status: 200, description: 'Returns sales representative statistics' })
  async getStats(@Request() req) {
    return this.salesRepService.getStats(req.user.userId);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get sales representative leads' })
  @ApiResponse({ status: 200, description: 'Returns list of leads', type: [Lead] })
  async getLeads(@Request() req) {
    return this.salesRepService.getLeads(req.user.userId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully', type: Lead })
  async createLead(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.salesRepService.createLead(createLeadDto);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get a specific lead' })
  @ApiResponse({ status: 200, description: 'Returns the lead', type: Lead })
  async getLead(@Param('id') id: string): Promise<Lead> {
    return this.salesRepService.getLead(id);
  }

  @Put('leads/:id')
  @ApiOperation({ summary: 'Update a lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully', type: Lead })
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    return this.salesRepService.updateLead(id, updateLeadDto);
  }

  @Put('leads/:id/status')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully', type: Lead })
  async updateLeadStatus(
    @Param('id') id: string,
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
  ): Promise<Lead> {
    return this.salesRepService.updateLeadStatus(id, updateLeadStatusDto.status);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  async deleteLead(@Param('id') id: string): Promise<void> {
    return this.salesRepService.deleteLead(id);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics and top leads' })
  @ApiResponse({ status: 200, description: 'Returns performance metrics' })
  async getPerformanceData(@Query() query: PerformanceQueryDto) {
    return this.salesRepService.getPerformanceData(query.period);
  }

  @Post('leads/:id/email')
  @ApiOperation({ summary: 'Send email to a lead' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(
    @Param('id') id: string,
    @Body() sendEmailDto: SendEmailDto,
  ): Promise<void> {
    return this.salesRepService.sendEmail(id, sendEmailDto);
  }
}