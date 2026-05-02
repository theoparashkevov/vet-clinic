import { Injectable } from '@nestjs/common';
import { BotHandler, ConversationWithState } from '../interfaces/bot-handler.interface';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { BotConversation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationService } from '../services/conversation.service';

@Injectable()
export class PatientHandler implements BotHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  canHandle(message: NormalizedMessage, conversation: ConversationWithState): boolean {
    const text = (message.text || '').trim().toLowerCase();
    return conversation.state === 'menu' && text === 'patients';
  }

  async handle(_message: NormalizedMessage, conversation: ConversationWithState): Promise<BotResponse> {
    if (!conversation.ownerId) {
      await this.conversationService.updateState(conversation.id, 'idle');
      return { text: 'Your account is not linked. Please provide your phone number to continue.' };
    }

    const patients = await this.prisma.patient.findMany({
      where: {
        ownerId: conversation.ownerId,
        status: { not: 'deceased' },
      },
      orderBy: { name: 'asc' },
    });

    await this.conversationService.updateState(conversation.id, 'menu');

    if (patients.length === 0) {
      return { text: 'No pets found on your account.\n\nType "menu" to see options.' };
    }

    const lines = patients.map((p) => {
      const details = [p.species, p.breed, p.sex].filter(Boolean).join(', ');
      return `• ${p.name}${details ? ` — ${details}` : ''}`;
    });

    return {
      text: `Your Pets:\n${lines.join('\n')}\n\nType "menu" to see options.`,
    };
  }
}
