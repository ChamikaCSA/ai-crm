import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { LeadSource } from '../schemas/lead.schema';

export class CreateLeadDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  contactName: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Lead source', enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource;

  @ApiProperty({ description: 'Estimated deal value', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @ApiProperty({ description: 'Notes about the lead', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}