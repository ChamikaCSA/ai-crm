import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    [key: string]: any;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  findAll() {
    return this.userService.findAll();
  }

  @Get('account')
  async getAccountDetails(@Req() req: RequestWithUser) {
    return this.userService.getAccountDetails(req.user.sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES_MANAGER)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Put(':id/change-password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }

  @Put(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ) {
    // Only allow users to update their own profile
    if (req.user.sub !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    return this.userService.updateProfile(
      id,
      updateProfileDto,
      req.ip,
      req.headers['user-agent'],
    );
  }
}