import { Injectable } from '@nestjs/common';
import { BotHandler, ConversationWithState } from '../interfaces/bot-handler.interface';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { BotConversation } from '@prisma/client';
import { ConversationService } from '../services/conversation.service';

@Injectable()
export class MenuHandler implements BotHandler {
  constructor(private readonly conversationService: ConversationService) {}

  canHandle(_message: NormalizedMessage, conversation: ConversationWithState): boolean {
    if (conversation.state === 'phone_verified') return true;
    if (conversation.state === 'menu') return true;
    return false;
  }

  async handle(_message: NormalizedMessage, conversation: ConversationWithState): Promise<BotResponse> {
    await this.conversationService.updateState(conversation.id, 'menu');

    return {
      text: `Main Menu\n\nWhat would you like to do?\n1. Appointments — type "appointments"\n2. My Pets — type "patients"\n3. Reminders — type "reminders"\n4. Show this menu — type "menu"`,
    };
  }
}
