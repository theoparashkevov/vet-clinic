import { Injectable } from '@nestjs/common';
import {
  AIProvider,
  AIProviderConfigMap,
  ChatMessage,
} from '../interfaces';

@Injectable()
export class TestAIProvider implements AIProvider {
  providerId = 'test';

  async generateCompletion(
    messages: ChatMessage[],
    _config: AIProviderConfigMap,
  ): Promise<string> {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.role === 'user');
    const prompt = lastUserMessage?.content ?? 'Hello';
    return `[TestAI] This is a mock response to: "${prompt}"`;
  }

  validateConfig(_config: AIProviderConfigMap): boolean {
    return true;
  }
}
