import { NormalizedMessage, BotResponse } from './bot-adapter.interface';
import { BotConversation } from '@prisma/client';

export interface BotHandler {
  canHandle(message: NormalizedMessage, conversation: BotConversation): boolean;
  handle(message: NormalizedMessage, conversation: BotConversation): Promise<BotResponse>;
}
