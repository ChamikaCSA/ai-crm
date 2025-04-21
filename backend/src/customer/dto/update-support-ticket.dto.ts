import { IsString, IsOptional, MaxLength } from 'class-validator';
import { SupportTicketStatus } from '../schemas/support-ticket.schema';

export class UpdateSupportTicketDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  subject?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  status?: SupportTicketStatus;

  @IsString()
  @IsOptional()
  resolution?: string;
}