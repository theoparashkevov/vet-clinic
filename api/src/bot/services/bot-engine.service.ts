import { Injectable, Logger } from '@nestjs/common';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { BotHandler } from '../interfaces/bot-handler.interface';
import { AdapterRegistryService } from './adapter-registry.service';
import { ConversationService } from './conversation.service';

@Injectable()
export class BotEngineService {
  private readonly logger = new Logger(BotEngineService.name);
  private readonly handlers: BotHandler[] = [];

  constructor(
    private readonly registry: AdapterRegistryService,
    private readonly conversationService: ConversationService,
  ) {}

  registerHandler(handler: BotHandler): void {
    this.handlers.push(handler);
  }

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

    const handler = this.findHandler(message, conversation);
    const response = await handler.handle(message, conversation);

    if (response) {
      await this.conversationService.createMessage({
        conversationId: conversation.id,
        direction: 'outbound',
        content: response.text,
        messageType: 'text',
      });
      await this.sendResponse(message.provider, message.senderId, response);
    }

    return response;
  }

  private findHandler(message: NormalizedMessage, conversation: unknown): BotHandler {
    for (const handler of this.handlers) {
      if (handler.canHandle(message, conversation as Parameters<BotHandler['canHandle']>[1])) {
        return handler;
      }
    }
    return {
      canHandle: () => true,
      handle: async () => ({
        text: 'Thank you for your message. A staff member will assist you shortly.',
      }),
    };
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
