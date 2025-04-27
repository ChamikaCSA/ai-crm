import { IsString, IsOptional, IsArray } from 'class-validator';

export class TicketReplyDto {
  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  attachments?: Array<{ name: string; url: string }>;
}