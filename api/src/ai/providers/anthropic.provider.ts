import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AIProviderConfigMap,
  ChatMessage,
} from '../interfaces';

interface AnthropicConfig extends AIProviderConfigMap {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

@Injectable()
export class AnthropicProvider implements AIProvider {
  providerId = 'anthropic';
  private readonly logger = new Logger(AnthropicProvider.name);

  validateConfig(config: AIProviderConfigMap): boolean {
    const cfg = config as AnthropicConfig;
    return typeof cfg.apiKey === 'string' && cfg.apiKey.length > 0;
  }

  async generateCompletion(
    messages: ChatMessage[],
    config: AIProviderConfigMap,
  ): Promise<string> {
    const cfg = config as AnthropicConfig;
    const apiKey = cfg.apiKey;
    const model = cfg.model || 'claude-3-opus-20240229';

    if (!apiKey) {
      throw new Error('Anthropic API key is missing');
    }

    const client = new Anthropic({
      apiKey,
      baseURL: cfg.baseUrl || undefined,
    });

    // Anthropic uses a system parameter separate from messages
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 2048,
        system: systemMessage?.content,
        messages: conversationMessages,
        temperature: 0.7,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Anthropic returned non-text response');
      }
      return content.text;
    } catch (error: any) {
      this.logger.error(
        `Anthropic completion failed: ${error.message || error}`,
      );
      throw new Error(
        `Anthropic provider error: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
