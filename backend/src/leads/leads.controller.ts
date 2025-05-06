import { Controller, Get, Post, Body, Param, Put, UseGuards, Delete } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead, LeadStatus } from './schemas/lead.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  async findAll(): Promise<Lead[]> {
    return this.leadsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Lead> {
    return this.leadsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Lead>,
  ): Promise<Lead> {
    return this.leadsService.update(id, updateData);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: LeadStatus,
  ): Promise<Lead> {
    return this.leadsService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.leadsService.delete(id);
  }
}