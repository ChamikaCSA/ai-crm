import { IsString, IsNotEmpty } from 'class-validator';

export class ChatbotMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChatbotResponseDto {
  @IsString()
  @IsNotEmpty()
  response: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}