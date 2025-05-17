import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('system/metrics')
  async getSystemMetrics() {
    return this.adminService.getSystemMetrics();
  }

  @Get('system/audit-logs')
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(limit);
  }

  @Get('system/events')
  async getSystemEvents() {
    return this.adminService.getSystemEvents();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('users/metrics')
  async getUserMetrics() {
    return this.adminService.getUserMetrics();
  }

  @Post('users')
  async createUser(
    @Body()
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isMfaEnabled: boolean;
      password: string;
    },
  ) {
    return this.adminService.createUser(userData);
  }

  @Get('users/:id')
  async getUser(@Param('id') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body()
    userData: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isMfaEnabled: boolean;
      isActive: boolean;
    }>,
  ) {
    return this.adminService.updateUser(userId, userData);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('dashboard/overview')
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }
}
