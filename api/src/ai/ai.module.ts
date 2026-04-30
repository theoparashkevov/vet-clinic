import { Module, OnModuleInit } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIProviderRegistry } from './ai-provider.registry';
import { TestAIProvider } from './providers/test.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

@Module({
  imports: [SettingsModule],
  controllers: [AIController],
  providers: [AIService, AIProviderRegistry, TestAIProvider, OpenAIProvider, AnthropicProvider],
  exports: [AIService, AIProviderRegistry],
})
export class AIModule implements OnModuleInit {
  constructor(
    private readonly registry: AIProviderRegistry,
    private readonly testProvider: TestAIProvider,
    private readonly openaiProvider: OpenAIProvider,
    private readonly anthropicProvider: AnthropicProvider,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.testProvider);
    this.registry.register(this.openaiProvider);
    this.registry.register(this.anthropicProvider);
  }
}
