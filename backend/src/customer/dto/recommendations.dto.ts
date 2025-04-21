import { IsString, IsArray, IsOptional } from 'class-validator';

export class RecommendationDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  type: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}