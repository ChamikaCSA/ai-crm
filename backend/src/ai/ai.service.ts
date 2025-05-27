import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { Interaction } from '../user/schemas/interaction.schema';
import {
  RecommendationType,
  RecommendationPriority,
  RecommendationDto,
} from '../customer/dto/recommendations.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Lead } from '../sales-rep/schemas/lead.schema';

@Injectable()
export class aiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateRecommendations(
    interactions: any[],
    userContext: {
      user: any;
      usersLeads: any[];
      supportHistory: any[];
    },
  ): Promise<RecommendationDto[]> {
    try {
      const prompt = `You are an AI-powered assistant for our CRM system, focused on providing personalized recommendations to help users improve their experience.

User Context: ${JSON.stringify(userContext)}

Please analyze this data and provide 3 personalized recommendations that:
1. Focus on improving the customer's experience with the CRM system
2. Consider their support ticket history and pain points
3. Align with their preferences and past interactions
4. Suggest next steps based on their usage patterns and AI insights
5. Include specific, actionable items

Format the response as a JSON array of recommendations, each with:
{
  "title": "Short, clear title",
  "description": "Detailed explanation in a friendly, encouraging tone",
  "priority": "high|medium|low",
  "actionItems": ["Specific action 1", "Specific action 2"],
  "expectedOutcome": "What to expect from following this recommendation"
}

Important Guidelines:
- Write in a friendly, encouraging tone that would be appropriate to show directly to users
- Focus on helping users improve their own experience with the CRM system
- Focus on system usage, feature adoption, and personal productivity
- Avoid mentioning specific user names or making the recommendations sound like internal notes
- Focus on positive outcomes and opportunities rather than problems or issues`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that generates personalized recommendations to help users improve their experience with the CRM system. Focus on actionable suggestions that help users get more value from the system. Write in a friendly, encouraging tone that would be appropriate to show directly to users.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const recommendations = JSON.parse(response.choices[0].message.content);
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private analyzeInteractionPatterns(interactions: Interaction[]) {
    const patterns = {
      frequentFeatures: new Map<string, number>(),
      commonIssues: new Map<string, number>(),
      timeOfDay: new Map<string, number>(),
      sessionDuration: [] as number[],
      featureUsage: new Map<string, number>(),
      supportNeeds: new Map<string, number>(),
    };

    interactions.forEach((interaction) => {
      // Track feature usage
      if (interaction.type === 'FEATURE_USAGE') {
        const feature = interaction.metadata?.featureName;
        if (feature) {
          patterns.frequentFeatures.set(
            feature,
            (patterns.frequentFeatures.get(feature) || 0) + 1,
          );
        }
      }

      // Track support needs
      if (interaction.type === 'SUPPORT_TICKET') {
        const issue = interaction.metadata?.issueType;
        if (issue) {
          patterns.supportNeeds.set(
            issue,
            (patterns.supportNeeds.get(issue) || 0) + 1,
          );
        }
      }

      // Track time patterns
      const hour = new Date(interaction.createdAt).getHours();
      const timeSlot = `${hour}:00`;
      patterns.timeOfDay.set(
        timeSlot,
        (patterns.timeOfDay.get(timeSlot) || 0) + 1,
      );

      // Track session duration if available
      if (interaction.metadata?.duration) {
        patterns.sessionDuration.push(interaction.metadata.duration);
      }
    });

    return {
      mostUsedFeatures: Array.from(patterns.frequentFeatures.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      commonSupportIssues: Array.from(patterns.supportNeeds.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      peakUsageHours: Array.from(patterns.timeOfDay.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
      averageSessionDuration:
        patterns.sessionDuration.length > 0
          ? patterns.sessionDuration.reduce((a, b) => a + b, 0) /
            patterns.sessionDuration.length
          : 0,
    };
  }

  async generateChatResponse(
    message: string,
    userContext: {
      user: any;
      usersLeads: any[];
      supportHistory: any[];
    },
    chatHistory?: { role: string; content: string }[],
  ): Promise<{ response: string; metadata?: { type: string; section: string } }> {
    try {
      const systemPrompt = `You are an AI-powered customer support assistant for our CRM system. Your role is to:
1. Provide immediate, accurate responses to customer queries
2. Offer personalized assistance based on the user's profile and history
3. Guide users to relevant support resources when needed
4. Maintain a friendly, professional tone
5. Escalate complex issues when necessary

User Context:
- User Profile: ${JSON.stringify(userContext.user)}
- Support History: ${JSON.stringify(userContext.supportHistory)}
- User's Leads: ${JSON.stringify(userContext.usersLeads)}

Available Customer Features:
1. Dashboard
   - Account summary with profile information
   - Recent activity tracking
   - Support ticket management
   - Personalized recommendations
   - Quick access to account settings

2. Account Management
   - Profile information updates
   - Email verification status
   - Account status monitoring
   - Last login tracking
   - Activity history

3. Support System
   - Create and manage support tickets
   - Track ticket status (Open, In Progress, Closed)
   - View ticket history
   - Real-time chat support
   - Access to help center resources

4. Activity Tracking
   - Chat interactions
   - Email communications
   - Support ticket activities
   - System interactions
   - Login history
   - Settings updates
   - Profile updates
   - Document views
   - Feature usage

5. Recommendations
   - Personalized suggestions based on usage
   - Feature adoption recommendations
   - Productivity improvements
   - System optimization tips

Important Guidelines:
- Always maintain a helpful and empathetic tone
- Provide specific, actionable solutions when possible
- Reference the user's history and preferences when relevant
- Suggest relevant features or resources that could help
- If a query requires human intervention, clearly state this and explain why
- Never share sensitive information or make promises about specific outcomes
- Guide users to appropriate sections of the dashboard based on their needs
- Explain features in the context of the user's current activity and history
- Provide step-by-step instructions when explaining complex features
- Always verify if the user has access to a feature before suggesting it`;

      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
      ];

      if (chatHistory && chatHistory.length > 0) {
        messages.push(
          ...chatHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        );
      }

      messages.push({
        role: 'user',
        content: message,
      });

      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4',
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      const processed = this.postProcessChatResponse(response, userContext);

      return {
        response: processed.content,
        metadata: processed.metadata
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  private postProcessChatResponse(response: string, userContext: any): { content: string; metadata?: { type: string; section: string } } {
    let processedResponse = response;
    let metadata: { type: string; section: string } | undefined;

    // Add personalized greeting if this is the first message
    if (!userContext.supportHistory?.length) {
      processedResponse = `Hello ${userContext.user?.name || 'there'}! ${processedResponse}`;
    }

    const lowerResponse = processedResponse.toLowerCase();

    // Overview/Dashboard suggestions
    if (lowerResponse.includes('dashboard') ||
        lowerResponse.includes('overview') ||
        lowerResponse.includes('main page') ||
        lowerResponse.includes('recent activity')) {
      metadata = { type: 'overview', section: '' };
    }

    // Support suggestions
    if (lowerResponse.includes('support') ||
        lowerResponse.includes('ticket') ||
        lowerResponse.includes('help') ||
        lowerResponse.includes('issue')) {
      metadata = { type: 'support', section: 'support' };
    }

    // Account suggestions
    if (lowerResponse.includes('account') ||
        lowerResponse.includes('profile') ||
        lowerResponse.includes('user') ||
        lowerResponse.includes('personal information')) {
      metadata = { type: 'account', section: 'account' };
    }

    // Settings suggestions
    if (lowerResponse.includes('settings') ||
        lowerResponse.includes('preferences') ||
        lowerResponse.includes('configuration') ||
        lowerResponse.includes('notifications')) {
      metadata = { type: 'settings', section: 'settings' };
    }

    // Add escalation note for complex issues
    if (lowerResponse.includes('complex') ||
        lowerResponse.includes('technical') ||
        lowerResponse.includes('error') ||
        lowerResponse.includes('problem')) {
      processedResponse += '\n\nIf you need further assistance, our support team is available 24/7.';
      // If no other metadata is set, suggest support section for complex issues
      if (!metadata) {
        metadata = { type: 'support', section: 'support' };
      }
    }

    return {
      content: processedResponse,
      metadata
    };
  }

  // Marketing Specialist AI methods
  async generateSegmentInsights(segmentData: any) {
    try {
      // If no specific customerIds are provided, analyze all customers
      let customers, leads;
      if (!segmentData.customerIds || segmentData.customerIds.length === 0) {
        customers = await this.userModel.find({ role: 'customer' });
        leads = await this.leadModel.find({ user: { $in: customers.map(c => c._id) } });
      } else {
        customers = await this.userModel.find({ _id: { $in: segmentData.customerIds } });
        leads = await this.leadModel.find({ user: { $in: segmentData.customerIds } });
      }

      // Aggregate customer data for analysis
      const customerData = {
        demographics: {
          ageDistribution: this.calculateAgeDistribution(customers),
          genderDistribution: this.calculateGenderDistribution(customers),
          locationDistribution: this.calculateLocationDistribution(customers),
        },
        behavior: {
          purchasePatterns: this.analyzePurchasePatterns(leads),
          engagementLevels: this.analyzeEngagementLevels(customers),
          channelPreferences: this.analyzeChannelPreferences(leads),
        },
        metrics: {
          averageLifetimeValue: this.calculateAverageLTV(leads),
          churnRisk: this.calculateChurnRisk(customers, leads),
          engagementScore: this.calculateEngagementScore(customers),
        }
      };

      const prompt = `Analyze the following customer segment with real customer data and provide insights:
        Name: ${segmentData.name}
        Type: ${segmentData.type}
        ${segmentData.customerIds?.length ? `Criteria: ${JSON.stringify(segmentData.criteria)}` : 'Analyzing entire customer base'}

        Customer Data Analysis:
        - Total Customers: ${customers.length}
        - Demographics: ${JSON.stringify(customerData.demographics)}
        - Behavior Patterns: ${JSON.stringify(customerData.behavior)}
        - Key Metrics: ${JSON.stringify(customerData.metrics)}

        Please provide:
        1. Key characteristics of this segment based on actual customer data
        2. Data-driven recommendations for targeting this segment
        3. Predicted behavior patterns based on historical data
        4. Specific action items to improve segment performance
        5. Risk factors and opportunities`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const insights = response.choices[0].message.content;
      return this.parseSegmentInsights(insights, customerData);
    } catch (error) {
      console.error('Error generating segment insights:', error);
      throw error;
    }
  }

  private calculateAgeDistribution(customers: User[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    customers.forEach(customer => {
      if (customer.demographics?.age) {
        const ageGroup = Math.floor(customer.demographics.age / 10) * 10;
        const ageRange = `${ageGroup}-${ageGroup + 9}`;
        distribution[ageRange] = (distribution[ageRange] || 0) + 1;
      }
    });
    return distribution;
  }

  private calculateGenderDistribution(customers: User[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    customers.forEach(customer => {
      if (customer.demographics?.gender) {
        distribution[customer.demographics.gender] = (distribution[customer.demographics.gender] || 0) + 1;
      }
    });
    return distribution;
  }

  private calculateLocationDistribution(customers: User[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    customers.forEach(customer => {
      if (customer.demographics?.location) {
        distribution[customer.demographics.location] = (distribution[customer.demographics.location] || 0) + 1;
      }
    });
    return distribution;
  }

  private analyzePurchasePatterns(leads: Lead[]): any {
    // Implementation to analyze purchase patterns
    return {
      averageOrderValue: this.calculateAverageOrderValue(leads),
      purchaseFrequency: this.calculatePurchaseFrequency(leads),
      productPreferences: this.analyzeProductPreferences(leads),
    };
  }

  private analyzeEngagementLevels(customers: User[]): any {
    // Implementation to analyze engagement levels
    return {
      averageInteractions: this.calculateAverageInteractions(customers),
      channelEngagement: this.analyzeChannelEngagement(customers),
      responseRates: this.calculateResponseRates(customers),
    };
  }

  private analyzeChannelPreferences(leads: Lead[]): any {
    // Implementation to analyze channel preferences
    return {
      preferredChannels: this.calculatePreferredChannels(leads),
      channelEffectiveness: this.analyzeChannelEffectiveness(leads),
    };
  }

  private calculateAverageLTV(leads: Lead[]): number {
    // Implementation to calculate average lifetime value
    return leads.reduce((sum, lead) => sum + (lead.purchaseHistory?.lifetimeValue || 0), 0) / leads.length;
  }

  private calculateChurnRisk(customers: User[], leads: Lead[]): number {
    // Implementation to calculate churn risk
    // Consider factors like last interaction, purchase frequency, etc.
    return 0; // Placeholder
  }

  private calculateEngagementScore(customers: User[]): number {
    // Implementation to calculate engagement score
    return customers.reduce((sum, customer) => sum + (customer.preferences?.length || 0), 0) / customers.length;
  }

  private parseSegmentInsights(insights: string, customerData: any) {
    // Enhanced parsing to include real customer data metrics
    return {
      keyCharacteristics: this.extractKeyCharacteristics(insights),
      recommendations: this.extractRecommendations(insights),
      predictedBehavior: this.extractPredictedBehavior(insights),
      metrics: customerData.metrics,
      demographics: customerData.demographics,
      behavior: customerData.behavior,
      lastUpdated: new Date(),
    };
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

  private parseCampaignRecommendations(recommendations: string) {
    const lines = recommendations.split('\n');
    return {
      optimizationSuggestions: lines
        .filter((line) => line.includes('optimization'))
        .map((line) => line.replace(/^[0-9]+\.\s*/, '')),
      audienceSegments: lines
        .filter((line) => line.includes('audience'))
        .map((line) => line.replace(/^[0-9]+\.\s*/, '')),
      contentImprovements: lines
        .filter((line) => line.includes('content'))
        .map((line) => line.replace(/^[0-9]+\.\s*/, '')),
      budgetAllocation: lines
        .filter((line) => line.includes('budget'))
        .map((line) => {
          const [channel, percentage] = line.split(':');
          return {
            channel: channel.replace(/^[0-9]+\.\s*/, ''),
            percentage: parseFloat(percentage) / 100,
          };
        }),
      predictedPerformance: lines
        .filter((line) => line.includes('prediction'))
        .map((line) => {
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
    const sentiment =
      lines
        .find((line) => line.toLowerCase().includes('sentiment'))
        ?.split(':')[1]
        ?.trim()
        ?.toLowerCase() || 'neutral';

    const score = parseFloat(
      lines
        .find((line) => line.toLowerCase().includes('score'))
        ?.split(':')[1]
        ?.trim() || '0.5',
    );

    const topics = lines
      .filter(
        (line) =>
          line.toLowerCase().includes('topic') ||
          line.toLowerCase().includes('theme'),
      )
      .map((line) => line.replace(/^[0-9]+\.\s*/, '').trim());

    const emotions = lines
      .filter((line) => line.toLowerCase().includes('emotion'))
      .map((line) => {
        const [emotion, score] = line.split(':');
        return {
          emotion: emotion.replace(/^[0-9]+\.\s*/, '').trim(),
          score: parseFloat(score?.trim() || '0') / 100,
        };
      });

    const actionItems = lines
      .filter((line) => line.toLowerCase().includes('action'))
      .map((line) => line.replace(/^[0-9]+\.\s*/, '').trim());

    const trendAnalysis =
      lines
        .find((line) => line.toLowerCase().includes('trend'))
        ?.split(':')[1]
        ?.trim() || 'No trend analysis available';

    return {
      sentiment,
      score,
      keywords: topics,
      metadata: {
        language: 'en',
        confidence: score > 0.7 ? 0.9 : score > 0.4 ? 0.7 : 0.5,
      },
      aiInsights: {
        topics,
        emotionBreakdown: emotions,
        actionItems,
        trendAnalysis,
      },
    };
  }

  async generateLeadScore(leadData: any) {
    try {
      const prompt = `Analyze the following lead data and provide a comprehensive scoring and insights:

      Lead Data: ${JSON.stringify(leadData, null, 2)}

      Return ONLY a JSON object with these fields:
      {
        "leadScore": number (0-100),
        "engagementScore": number (0-100),
        "conversionProbability": number (0-100),
        "nextBestAction": string,
        "riskFactors": string[],
        "opportunityAreas": string[]
      }`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              "You are an AI assistant specialized in lead scoring and analysis. Your analysis should be based on the lead's profile, behavior, and potential value. Always return valid JSON.",
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content || '{}';
      const analysis = JSON.parse(content);

      return {
        leadScore: analysis.leadScore || 0,
        aiInsights: {
          engagementScore: analysis.engagementScore || 0,
          conversionProbability: analysis.conversionProbability || 0,
          nextBestAction: analysis.nextBestAction || 'Schedule initial contact',
          riskFactors: analysis.riskFactors || [],
          opportunityAreas: analysis.opportunityAreas || [],
          lastScoredAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Error generating lead score:', error);
      // Fallback to basic scoring if AI fails
      return {
        leadScore: 0,
        aiInsights: {
          engagementScore: 0,
          conversionProbability: 0,
          nextBestAction: 'Schedule initial contact',
          riskFactors: [],
          opportunityAreas: [],
          lastScoredAt: new Date(),
        },
      };
    }
  }

  private calculateAverageOrderValue(leads: Lead[]): number {
    return leads.reduce((sum, lead) => sum + (lead.purchaseHistory?.averageOrderValue || 0), 0) / leads.length;
  }

  private calculatePurchaseFrequency(leads: Lead[]): number {
    return leads.reduce((sum, lead) => sum + (lead.purchaseHistory?.purchaseFrequency || 0), 0) / leads.length;
  }

  private analyzeProductPreferences(leads: Lead[]): Record<string, number> {
    const preferences: Record<string, number> = {};
    leads.forEach(lead => {
      lead.purchaseHistory?.products.forEach(product => {
        preferences[product] = (preferences[product] || 0) + 1;
      });
    });
    return preferences;
  }

  private calculateAverageInteractions(customers: User[]): number {
    return customers.reduce((sum, customer) => sum + (customer.interactionHistory?.length || 0), 0) / customers.length;
  }

  private analyzeChannelEngagement(customers: User[]): Record<string, number> {
    const engagement: Record<string, number> = {};
    customers.forEach(customer => {
      customer.preferences?.forEach(pref => {
        if (pref.category === 'channel') {
          engagement[pref.value] = (engagement[pref.value] || 0) + 1;
        }
      });
    });
    return engagement;
  }

  private calculateResponseRates(customers: User[]): number {
    // Implementation to calculate response rates based on interaction history
    return customers.reduce((sum, customer) => {
      const interactions = customer.interactionHistory?.length || 0;
      const responses = customer.interactionHistory?.filter(i => i.includes('response')).length || 0;
      return sum + (responses / interactions || 0);
    }, 0) / customers.length;
  }

  private calculatePreferredChannels(leads: Lead[]): Record<string, number> {
    const channels: Record<string, number> = {};
    leads.forEach(lead => {
      lead.channelHistory?.forEach(channel => {
        channels[channel.channel] = (channels[channel.channel] || 0) + 1;
      });
    });
    return channels;
  }

  private analyzeChannelEffectiveness(leads: Lead[]): Record<string, number> {
    const effectiveness: Record<string, number> = {};
    leads.forEach(lead => {
      lead.channelHistory?.forEach(channel => {
        if (channel.interactionType === 'conversion') {
          effectiveness[channel.channel] = (effectiveness[channel.channel] || 0) + 1;
        }
      });
    });
    return effectiveness;
  }

  private extractKeyCharacteristics(insights: string): string[] {
    const lines = insights.split('\n');
    return lines
      .filter(line => line.includes('characteristic') || line.includes('trait'))
      .map(line => line.replace(/^[0-9]+\.\s*/, '').trim());
  }

  private extractRecommendations(insights: string): string[] {
    const lines = insights.split('\n');
    return lines
      .filter(line => line.includes('recommendation') || line.includes('action'))
      .map(line => line.replace(/^[0-9]+\.\s*/, '').trim());
  }

  private extractPredictedBehavior(insights: string): string[] {
    const lines = insights.split('\n');
    return lines
      .filter(line => line.includes('behavior') || line.includes('pattern'))
      .map(line => line.replace(/^[0-9]+\.\s*/, '').trim());
  }
}
