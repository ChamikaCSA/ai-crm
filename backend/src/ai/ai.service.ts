import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Interaction } from '../customer/schemas/interaction.schema';

@Injectable()
export class aiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateRecommendations(interactions: Interaction[]) {
    // TODO: Implement OpenAI recommendation generation
    return [];
  }

  async generateChatResponse(
    message: string,
    userName: string,
    sessionId: string,
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a helpful customer support assistant for our CRM system.
                     The user you're talking to is ${userName}.`,
          },
          { role: 'user', content: message },
        ],
        model: 'gpt-3.5-turbo',
      });

      return completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return 'I apologize, but I am currently experiencing technical difficulties. Please try again later.';
    }
  }
}