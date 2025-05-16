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
    // Mock recommendations for testing
    return [
      {
        id: '1',
        title: 'Follow up with customer',
        description: 'Customer showed interest in premium features during last interaction',
        priority: 'high',
        action: 'Schedule a call to discuss premium features',
        score: 0.85,
        type: 'follow_up'
      },
      {
        id: '2',
        title: 'Send product documentation',
        description: 'Customer asked about integration capabilities',
        priority: 'medium',
        action: 'Share integration guide and API documentation',
        score: 0.75,
        type: 'documentation'
      },
      {
        id: '3',
        title: 'Check customer satisfaction',
        description: 'Customer had a support ticket resolved recently',
        priority: 'low',
        action: 'Send satisfaction survey',
        score: 0.65,
        type: 'feedback'
      }
    ];
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
      throw error;
    }
  }

  // Marketing Specialist AI methods
  async generateSegmentInsights(segmentData: any) {
    try {
      const prompt = `Analyze the following customer segment and provide insights:
        Name: ${segmentData.name}
        Type: ${segmentData.type}
        Criteria: ${JSON.stringify(segmentData.criteria)}

        Please provide:
        1. Key characteristics of this segment
        2. Recommendations for targeting this segment
        3. Predicted behavior patterns`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const insights = response.choices[0].message.content;
      return this.parseSegmentInsights(insights);
    } catch (error) {
      console.error('Error generating segment insights:', error);
      throw error;
    }
  }

  async generateCampaignRecommendations(campaignData: any) {
    try {
      const prompt = `Analyze the following marketing campaign and provide recommendations:
        Name: ${campaignData.name}
        Type: ${campaignData.type}
        Target Segment: ${campaignData.targetSegment}
        Budget: ${campaignData.budget}
        Objectives: ${campaignData.objectives}

        Please provide:
        1. Optimization suggestions
        2. Recommended audience segments
        3. Content improvement ideas
        4. Budget allocation recommendations
        5. Performance predictions`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const recommendations = response.choices[0].message.content;
      return this.parseCampaignRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating campaign recommendations:', error);
      throw error;
    }
  }

  async analyzeSentiment(sentimentData: any) {
    try {
      const prompt = `Analyze the sentiment of the following content:
        Content: ${sentimentData.content}
        Source: ${sentimentData.source}

        Please provide a detailed analysis in the following format:
        1. Overall sentiment (positive/negative/neutral)
        2. Sentiment score (0-1)
        3. Key topics and themes
        4. Emotion breakdown (list of emotions with scores)
        5. Action items
        6. Trend analysis

        Format the response in a structured way that can be easily parsed.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const analysis = response.choices[0].message.content;
      return this.parseSentimentAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  private parseSegmentInsights(insights: string) {
    const lines = insights.split('\n');
    return {
      keyCharacteristics: lines
        .filter(line => line.includes('characteristic'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '')),
      recommendations: lines
        .filter(line => line.includes('recommendation'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '')),
      predictedBehavior: lines
        .filter(line => line.includes('behavior'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '')),
    };
  }

  private parseCampaignRecommendations(recommendations: string) {
    const lines = recommendations.split('\n');
    return {
      optimizationSuggestions: lines
        .filter(line => line.includes('optimization'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '')),
      audienceSegments: lines
        .filter(line => line.includes('audience'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '')),
      contentImprovements: lines
        .filter(line => line.includes('content'))
        .map(line => line.replace(/^[0-9]+\.\s*/, '')),
      budgetAllocation: lines
        .filter(line => line.includes('budget'))
        .map(line => {
          const [channel, percentage] = line.split(':');
          return {
            channel: channel.replace(/^[0-9]+\.\s*/, ''),
            percentage: parseFloat(percentage) / 100,
          };
        }),
      predictedPerformance: lines
        .filter(line => line.includes('prediction'))
        .map(line => {
          const [metric, value] = line.split(':');
          return {
            metric: metric.replace(/^[0-9]+\.\s*/, ''),
            value: parseFloat(value),
          };
        }),
    };
  }

  private parseSentimentAnalysis(analysis: string) {
    const lines = analysis.split('\n');
    const sentiment = lines
      .find(line => line.toLowerCase().includes('sentiment'))
      ?.split(':')[1]
      ?.trim()
      ?.toLowerCase() || 'neutral';

    const score = parseFloat(
      lines
        .find(line => line.toLowerCase().includes('score'))
        ?.split(':')[1]
        ?.trim() || '0.5'
    );

    const topics = lines
      .filter(line => line.toLowerCase().includes('topic') || line.toLowerCase().includes('theme'))
      .map(line => line.replace(/^[0-9]+\.\s*/, '').trim());

    const emotions = lines
      .filter(line => line.toLowerCase().includes('emotion'))
      .map(line => {
        const [emotion, score] = line.split(':');
        return {
          emotion: emotion.replace(/^[0-9]+\.\s*/, '').trim(),
          score: parseFloat(score?.trim() || '0') / 100
        };
      });

    const actionItems = lines
      .filter(line => line.toLowerCase().includes('action'))
      .map(line => line.replace(/^[0-9]+\.\s*/, '').trim());

    const trendAnalysis = lines
      .find(line => line.toLowerCase().includes('trend'))
      ?.split(':')[1]
      ?.trim() || 'No trend analysis available';

    return {
      sentiment,
      score,
      keywords: topics,
      metadata: {
        language: 'en',
        confidence: score > 0.7 ? 0.9 : score > 0.4 ? 0.7 : 0.5
      },
      aiInsights: {
        topics,
        emotionBreakdown: emotions,
        actionItems,
        trendAnalysis
      }
    };
  }
}