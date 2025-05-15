import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { SalesRepService } from './sales-rep.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/sales-rep')
@UseGuards(JwtAuthGuard)
export class SalesRepController {
  constructor(private readonly salesRepService: SalesRepService) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.salesRepService.getStats(req.user.userId);
  }

  @Get('leads')
  async getLeads(@Request() req) {
    return this.salesRepService.getLeads(req.user.userId);
  }
}