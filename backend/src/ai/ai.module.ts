import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { aiService } from './ai.service';

@Module({
  imports: [ConfigModule],
  providers: [aiService],
  exports: [aiService],
})
export class AIModule {}