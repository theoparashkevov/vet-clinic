import { Injectable } from '@nestjs/common';
import { BotHandler, ConversationWithState } from '../interfaces/bot-handler.interface';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { BotConversation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationService } from '../services/conversation.service';

@Injectable()
export class ReminderHandler implements BotHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  canHandle(message: NormalizedMessage, conversation: ConversationWithState): boolean {
    const text = (message.text || '').trim().toLowerCase();
    return conversation.state === 'menu' && text === 'reminders';
  }

  async handle(_message: NormalizedMessage, conversation: ConversationWithState): Promise<BotResponse> {
    if (!conversation.ownerId) {
      await this.conversationService.updateState(conversation.id, 'idle');
      return { text: 'Your account is not linked. Please provide your phone number to continue.' };
    }

    const patients = await this.prisma.patient.findMany({
      where: { ownerId: conversation.ownerId },
      select: { id: true },
    });

    const patientIds = patients.map((p) => p.id);

    const reminders = await this.prisma.followUpReminder.findMany({
      where: {
        patientId: { in: patientIds },
        status: 'pending',
        dueDate: { gte: new Date() },
      },
      include: { patient: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    await this.conversationService.updateState(conversation.id, 'menu');

    if (reminders.length === 0) {
      return { text: 'You have no pending reminders.\n\nType "menu" to see options.' };
    }

    const lines = reminders.map((r) => {
      const date = r.dueDate.toLocaleDateString();
      const pet = r.patient?.name || 'Unknown pet';
      return `• ${date} — ${r.title} (${pet})${r.description ? `\n  ${r.description}` : ''}`;
    });

    return {
      text: `Pending Reminders:\n${lines.join('\n')}\n\nType "menu" to see options.`,
    };
  }
}
