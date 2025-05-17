import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { AuditLog, AuditLogSchema } from '../audit/schemas/audit.schema';
import { SystemEvent, SystemEventSchema } from '../audit/schemas/system-event.schema';
import { PasswordService } from '../common/services/password.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: SystemEvent.name, schema: SystemEventSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, PasswordService],
})
export class AdminModule {}