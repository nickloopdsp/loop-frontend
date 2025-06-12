import OpenAI from 'openai';
import type { ChatMessage } from '@shared/schema';

// Interface for AI providers to implement
export interface AIProvider {
  generateResponse(messages: AIMessage[], context?: AIContext): Promise<string>;
  generateStreamingResponse?(messages: AIMessage[], context?: AIContext): AsyncGenerator<string>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIContext {
  artistName?: string;
  artistStats?: any;
  conversationHistory?: ChatMessage[];
  [key: string]: any;
}

// OpenAI implementation
class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private models: string[];
  private maxTokens: number;
  private temperature: number;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo', maxTokens: number = 1000, temperature: number = 0.7) {
    this.client = new OpenAI({ apiKey });
    // Try multiple models in order of preference
    this.models = [model, 'gpt-4o-mini', 'gpt-3.5-turbo'];
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generateResponse(messages: AIMessage[], context?: AIContext): Promise<string> {
    const systemMessage = this.buildSystemMessage(context);
    const allMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages
    ];

    // Try each model in order until one works
    let lastError: any;
    
    for (const model of this.models) {
      try {
        console.log(`Attempting OpenAI API call with model: ${model}`);
        const completion = await this.client.chat.completions.create({
          model: model,
          messages: allMessages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        });

        return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
      } catch (error: any) {
        console.error(`OpenAI API error with model ${model}:`, error.message);
        lastError = error;
        
        // If it's a quota error, don't try other models
        if (error.code === 'insufficient_quota' || error.status === 402) {
          throw new Error('Your OpenAI account has insufficient credits. Please add credits at https://platform.openai.com/account/billing');
        }
        
        // If it's not a model not found error, throw it
        if (error.code !== 'model_not_found') {
          throw this.formatError(error, model);
        }
        
        // Otherwise, try the next model
        console.log(`Model ${model} not available, trying next model...`);
      }
    }
    
    // If we've tried all models and none worked
    throw this.formatError(lastError, this.models[this.models.length - 1]);
  }

  private formatError(error: any, model: string): Error {
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      code: error.code,
      type: error.type
    });
    
    // Provide more specific error messages
    if (error.status === 404 && error.code === 'model_not_found') {
      return new Error(`Model "${model}" not found. Please check your API key permissions.`);
    } else if (error.status === 401) {
      return new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (error.status === 429 && error.code === 'insufficient_quota') {
      return new Error('Your OpenAI account has insufficient credits. Please add credits at https://platform.openai.com/account/billing');
    } else if (error.status === 429) {
      return new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 402) {
      return new Error('Insufficient credits. Please check your OpenAI account billing.');
    }
    
    return new Error('Failed to generate AI response. Please try again.');
  }

  async *generateStreamingResponse(messages: AIMessage[], context?: AIContext): AsyncGenerator<string> {
    try {
      const systemMessage = this.buildSystemMessage(context);
      const allMessages = [
        { role: 'system' as const, content: systemMessage },
        ...messages
      ];

      const stream = await this.client.chat.completions.create({
        model: this.models[0],
        messages: allMessages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error('Failed to generate streaming response');
    }
  }

  private buildSystemMessage(context?: AIContext): string {
    let systemMessage = `You are MC (Music Concierge), an AI-powered music career assistant for independent artists. 
You provide expert advice on:
- Music promotion and marketing strategies
- Tour planning and venue recommendations
- Social media growth and engagement
- Revenue optimization across streaming, merch, and live performances
- Industry trends and data-driven insights
- Fan engagement and community building

Your responses should be:
- Professional yet friendly and encouraging
- Data-driven when possible
- Specific and actionable
- Tailored to independent artists' needs and budgets
- Aware of current music industry trends and platforms`;

    if (context?.artistName) {
      systemMessage += `\n\nYou are currently assisting ${context.artistName}.`;
    }

    if (context?.artistStats) {
      systemMessage += `\n\nCurrent artist stats: ${JSON.stringify(context.artistStats)}`;
    }

    return systemMessage;
  }
}

// Main AI Service class
export class AIService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generateChatResponse(
    userMessage: string, 
    conversationHistory: ChatMessage[] = [], 
    context?: AIContext
  ): Promise<string> {
    // Convert chat history to AI messages format
    const messages: AIMessage[] = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    // Add the new user message
    messages.push({ role: 'user', content: userMessage });

    return this.provider.generateResponse(messages, context);
  }

  async *streamChatResponse(
    userMessage: string, 
    conversationHistory: ChatMessage[] = [], 
    context?: AIContext
  ): AsyncGenerator<string> {
    if (!this.provider.generateStreamingResponse) {
      throw new Error('Streaming not supported by current AI provider');
    }

    // Convert chat history to AI messages format
    const messages: AIMessage[] = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    // Add the new user message
    messages.push({ role: 'user', content: userMessage });

    yield* this.provider.generateStreamingResponse(messages, context);
  }

  // Strategy analysis for document review
  async analyzeStrategy(documentContent: string, documentType: string = 'marketing'): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    insights: string;
  }> {
    const messages: AIMessage[] = [{
      role: 'user',
      content: `Please analyze this ${documentType} strategy document and provide:
1. An overall score out of 100
2. Key strengths (as a bullet list)
3. Areas for improvement (as a bullet list)
4. Strategic insights and recommendations

Document content:
${documentContent}`
    }];

    const response = await this.provider.generateResponse(messages);
    
    // Parse the response - in production, you'd want more robust parsing
    return {
      score: 85, // This would be extracted from the AI response
      strengths: [
        "Strong creative concept with viral potential",
        "Well-defined target audience demographics",
        "Multi-platform approach"
      ],
      improvements: [
        "Consider extending campaign duration",
        "Include more micro-influencer partnerships",
        "Add A/B testing for creative variations"
      ],
      insights: response
    };
  }
}

// Factory function to create AI service
export function createAIService(
  apiKey: string,
  provider: 'openai' | 'anthropic' = 'openai',
  config?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): AIService {
  let aiProvider: AIProvider;

  switch (provider) {
    case 'openai':
      aiProvider = new OpenAIProvider(
        apiKey,
        config?.model || process.env.AI_MODEL || 'gpt-3.5-turbo',
        config?.maxTokens || parseInt(process.env.AI_MAX_TOKENS || '1000'),
        config?.temperature || parseFloat(process.env.AI_TEMPERATURE || '0.7')
      );
      break;
    // Add more providers here in the future
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  return new AIService(aiProvider);
} 