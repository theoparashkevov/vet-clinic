import { Injectable, Logger } from '@nestjs/common';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { AdapterRegistryService } from './adapter-registry.service';
import { ConversationService } from './conversation.service';

@Injectable()
export class BotEngineService {
  private readonly logger = new Logger(BotEngineService.name);

  constructor(
    private readonly registry: AdapterRegistryService,
    private readonly conversationService: ConversationService,
  ) {}

  async process(message: NormalizedMessage): Promise<BotResponse | null> {
    this.logger.log(`Processing message from ${message.provider} / ${message.senderId}`);

    const conversation = await this.conversationService.getOrCreateConversation(
      message.provider,
      message.senderId,
    );

    await this.conversationService.createMessage({
      conversationId: conversation.id,
      direction: 'inbound',
      content: message.text || '',
      messageType: message.eventType,
    });

    const handler = this.findHandler(conversation.status);
    const response = await handler(message, conversation);

    if (response) {
      await this.sendResponse(message.provider, message.senderId, response);
    }

    return response;
  }

  private findHandler(_state: string): (msg: NormalizedMessage, conv: unknown) => Promise<BotResponse | null> {
    return async () => ({
      text: 'Thank you for your message. A staff member will assist you shortly.',
    });
  }

  private async sendResponse(
    provider: string,
    recipientId: string,
    response: BotResponse,
  ): Promise<void> {
    const adapter = this.registry.get(provider);
    if (!adapter) {
      this.logger.warn(`No adapter found for provider: ${provider}`);
      return;
    }

    const result = await adapter.sendText(recipientId, response.text);

    if (result.success) {
      this.logger.log(`Response sent to ${recipientId} via ${provider}`);
    } else {
      this.logger.error(`Failed to send response to ${recipientId}: ${result.error}`);
    }
  }
}
