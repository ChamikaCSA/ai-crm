import { IsString, IsEnum, IsOptional, IsArray, IsNotEmpty, MaxLength } from 'class-validator';
import { SupportTicketPriority, SupportTicketCategory } from '../schemas/support-ticket.schema';

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsEnum(SupportTicketPriority)
  @IsOptional()
  priority?: SupportTicketPriority;

  @IsEnum(SupportTicketCategory)
  @IsOptional()
  category?: SupportTicketCategory;

  @IsArray()
  @IsOptional()
  attachments?: Array<{ name: string; url: string }>;
}