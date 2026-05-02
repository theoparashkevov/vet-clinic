import { Injectable } from '@nestjs/common';
import { BotHandler, ConversationWithState } from '../interfaces/bot-handler.interface';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { BotConversation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationService } from '../services/conversation.service';

@Injectable()
export class IdentityHandler implements BotHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  canHandle(message: NormalizedMessage, conversation: ConversationWithState): boolean {
    const text = (message.text || '').trim();
    const isPhone = /^\+?[\d\s\-]{6,20}$/.test(text.replace(/\s/g, ''));

    if (conversation.state === 'idle') return true;
    if (conversation.state === 'awaiting_phone') return true;
    if (isPhone && !conversation.ownerId) return true;

    return false;
  }

  async handle(message: NormalizedMessage, conversation: ConversationWithState): Promise<BotResponse> {
    const text = (message.text || '').trim();

    if (conversation.state === 'idle') {
      await this.conversationService.updateState(conversation.id, 'awaiting_phone');
      return {
        text: 'Welcome to Vet Clinic! To get started, please share your phone number so we can link you to your account.',
      };
    }

    const digits = text.replace(/\D/g, '');

    if (digits.length < 6) {
      return {
        text: 'That does not look like a valid phone number. Please enter a valid phone number (e.g., +359 888 123 456).',
      };
    }

    const owners = await this.prisma.owner.findMany({
      select: { id: true, name: true, phone: true },
    });

    const owner = owners.find((o) => {
      const ownerDigits = o.phone.replace(/\D/g, '');
      return ownerDigits.includes(digits) || digits.includes(ownerDigits);
    });

    if (!owner) {
      return {
        text: `We could not find an account with that phone number. Please try again or contact the clinic directly.`,
      };
    }

    await this.conversationService.linkOwner(conversation.id, owner.id);
    await this.conversationService.updateState(conversation.id, 'menu');

    return {
      text: `Hi ${owner.name}! Your account has been linked.\n\nWhat would you like to do?\n1. Appointments — type "appointments"\n2. My Pets — type "patients"\n3. Reminders — type "reminders"\n4. Show this menu — type "menu"`,
    };
  }
}
