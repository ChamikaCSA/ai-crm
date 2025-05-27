import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { aiService } from './ai.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Lead, LeadSchema } from '../sales-rep/schemas/lead.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  providers: [aiService],
  exports: [aiService],
})
export class AIModule {}