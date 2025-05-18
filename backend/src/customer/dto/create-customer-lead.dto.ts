import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsObject, IsBoolean, IsArray } from 'class-validator';
import { PreferredContactMethod } from '../../sales-rep/schemas/lead.schema';

export class CreateCustomerLeadDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: 'Job title', required: false })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Notes about the lead', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Lead preferences', required: false })
  @IsObject()
  @IsOptional()
  preferences?: {
    preferredContactMethod: PreferredContactMethod;
    preferredContactTime?: string;
    interests?: string[];
    budget?: number;
    timeline?: string;
    painPoints?: string[];
    decisionMaker?: boolean;
  };

  @ApiProperty({ description: 'Lead demographics', required: false })
  @IsObject()
  @IsOptional()
  demographics?: {
    industry?: string;
    companySize?: string;
    location?: string;
    annualRevenue?: number;
    employeeCount?: number;
  };
}