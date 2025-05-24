import { IsString, IsNotEmpty, IsArray, IsOptional, IsObject } from 'class-validator';

export class ChatMessage {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatbotMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  chatHistory?: ChatMessage[];
}

export class ChatbotResponseDto {
  @IsString()
  @IsNotEmpty()
  response: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    type: string;
    section: string;
  };
}