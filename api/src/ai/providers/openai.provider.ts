import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  AIProvider,
  AIProviderConfigMap,
  ChatMessage,
} from '../interfaces';

interface OpenAIConfig extends AIProviderConfigMap {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

@Injectable()
export class OpenAIProvider implements AIProvider {
  providerId = 'openai';
  private readonly logger = new Logger(OpenAIProvider.name);

  validateConfig(config: AIProviderConfigMap): boolean {
    const cfg = config as OpenAIConfig;
    return typeof cfg.apiKey === 'string' && cfg.apiKey.length > 0;
  }

  async generateCompletion(
    messages: ChatMessage[],
    config: AIProviderConfigMap,
  ): Promise<string> {
    const cfg = config as OpenAIConfig;
    const apiKey = cfg.apiKey;
    const model = cfg.model || 'gpt-4o';

    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }

    const client = new OpenAI({
      apiKey,
      baseURL: cfg.baseUrl || undefined,
    });

    try {
      const response = await client.chat.completions.create({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }
      return content;
    } catch (error: any) {
      this.logger.error(
        `OpenAI completion failed: ${error.message || error}`,
      );
      throw new Error(
        `OpenAI provider error: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
