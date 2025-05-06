import { IsEmail, IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { LeadSource } from '../schemas/lead.schema';

export class CreateLeadDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsMongoId()
  @IsOptional()
  user?: string;

  @IsOptional()
  preferences?: {
    preferredContactMethod?: string;
    preferredContactTime?: string;
    interests?: string[];
  };
}