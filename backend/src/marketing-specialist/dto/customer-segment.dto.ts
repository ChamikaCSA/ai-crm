import { IsString, IsArray, IsObject, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CustomerSegmentCriteriaDto {
  @IsObject()
  @IsOptional()
  demographics?: {
    ageRange?: [number, number];
    gender?: string[];
    location?: string[];
    incomeRange?: [number, number];
  };

  @IsObject()
  @IsOptional()
  behavior?: {
    purchaseHistory?: string[];
    websiteActivity?: string[];
    engagementLevel?: string;
    lastInteractionDate?: Date;
  };

  @IsObject()
  @IsOptional()
  preferences?: {
    interests?: string[];
    preferredChannels?: string[];
    productCategories?: string[];
  };
}

export class CreateCustomerSegmentDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  customerIds: string[];

  @IsObject()
  criteria: CustomerSegmentCriteriaDto;
}

export class UpdateCustomerSegmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customerIds?: string[];

  @IsObject()
  @IsOptional()
  criteria?: CustomerSegmentCriteriaDto;
}