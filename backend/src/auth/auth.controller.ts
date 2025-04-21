import { Controller, Post, Body, UseGuards, Req, Get, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    [key: string]: any;
  };
}

class VerifyEmailDto {
  token: string;
}

class RequestPasswordResetDto {
  email: string;
}

class ResetPasswordDto {
  token: string;
  newPassword: string;
}

class UpdateProfileDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    return this.authService.register(
      createUserDto.email,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    return this.authService.login(
      req.user,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('request-password-reset')
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
    @Req() req: Request,
  ) {
    return this.authService.requestPasswordReset(
      requestPasswordResetDto.email,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(
      req.user.sub,
      updateProfileDto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('mfa/generate')
  async generateMfaSecret(@Req() req: RequestWithUser) {
    return this.authService.generateMfaSecret(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  async verifyMfaToken(
    @Req() req: RequestWithUser,
    @Body('token') token: string,
  ) {
    return this.authService.verifyMfaToken(req.user.sub, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  async enableMfa(
    @Req() req: RequestWithUser,
    @Body('token') token: string,
  ) {
    return this.authService.enableMfa(
      req.user.sub,
      token,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  async disableMfa(@Req() req: RequestWithUser) {
    return this.authService.disableMfa(
      req.user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: RequestWithUser) {
    const user = await this.usersService.findOne(req.user.sub);
    return { data: { user } };
  }
}