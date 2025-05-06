import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PasswordService } from '../common/services/password.service';
import { EmailService } from '../common/services/email.service';
import { AuditLog, AuditLogSchema } from '../audit/schemas/audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, PasswordService, EmailService],
  exports: [UserService],
})
export class UserModule {}