import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Interaction, InteractionSchema } from './schemas/interaction.schema';
import { SupportTicket, SupportTicketSchema } from './schemas/support-ticket.schema';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Interaction.name, schema: InteractionSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
    AIModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}