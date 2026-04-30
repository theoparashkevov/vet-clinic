import { Module, OnModuleInit } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIProviderRegistry } from './ai-provider.registry';
import { TestAIProvider } from './providers/test.provider';

@Module({
  controllers: [AIController],
  providers: [AIService, AIProviderRegistry, TestAIProvider],
  exports: [AIService, AIProviderRegistry],
})
export class AIModule implements OnModuleInit {
  constructor(
    private readonly registry: AIProviderRegistry,
    private readonly testProvider: TestAIProvider,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.testProvider);
  }
}
