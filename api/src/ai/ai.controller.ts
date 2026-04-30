import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIProviderRegistry } from './ai-provider.registry';
import { ChatCompletionRequest } from './interfaces';
import { ChatCompletionDto } from './dto';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly registry: AIProviderRegistry,
  ) {}

  @Post('chat')
  async chat(@Body() dto: ChatCompletionDto) {
    if (!this.registry.has(dto.provider)) {
      throw new BadRequestException(
        `Provider "${dto.provider}" is not available`,
      );
    }

    const request: ChatCompletionRequest = {
      provider: dto.provider,
      messages: dto.messages,
      pageContext: dto.pageContext,
    };

    return this.aiService.generateCompletion(request);
  }
}
