import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Interaction, InteractionSchema } from './schemas/interaction.schema';
import { SupportTicket, SupportTicketSchema } from './schemas/support-ticket.schema';
import { aiService } from '../ai/ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Interaction.name, schema: InteractionSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, aiService],
  exports: [CustomerService],
})
export class CustomerModule {}