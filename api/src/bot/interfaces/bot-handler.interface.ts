import { NormalizedMessage, BotResponse } from './bot-adapter.interface';
import { BotConversation } from '@prisma/client';

export type ConversationWithState = BotConversation & { state?: string; context?: unknown };

export interface BotHandler {
  canHandle(message: NormalizedMessage, conversation: ConversationWithState): boolean;
  handle(message: NormalizedMessage, conversation: ConversationWithState): Promise<BotResponse>;
}
