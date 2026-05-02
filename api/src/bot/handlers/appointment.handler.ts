import { Injectable } from '@nestjs/common';
import { BotHandler, ConversationWithState } from '../interfaces/bot-handler.interface';
import { NormalizedMessage, BotResponse } from '../interfaces/bot-adapter.interface';
import { BotConversation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationService } from '../services/conversation.service';

@Injectable()
export class AppointmentHandler implements BotHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  canHandle(message: NormalizedMessage, conversation: ConversationWithState): boolean {
    const text = (message.text || '').trim().toLowerCase();
    return conversation.state === 'menu' && text === 'appointments';
  }

  async handle(_message: NormalizedMessage, conversation: ConversationWithState): Promise<BotResponse> {
    if (!conversation.ownerId) {
      await this.conversationService.updateState(conversation.id, 'idle');
      return { text: 'Your account is not linked. Please provide your phone number to continue.' };
    }

    const now = new Date();
    const appointments = await this.prisma.appointment.findMany({
      where: {
        ownerId: conversation.ownerId,
        startsAt: { gte: now },
        status: { not: 'CANCELLED' },
      },
      include: { patient: { select: { name: true } }, doctor: { select: { name: true } } },
      orderBy: { startsAt: 'asc' },
      take: 10,
    });

    await this.conversationService.updateState(conversation.id, 'menu');

    if (appointments.length === 0) {
      return { text: 'You have no upcoming appointments.\n\nType "menu" to see options.' };
    }

    const lines = appointments.map((a) => {
      const date = a.startsAt.toLocaleDateString();
      const time = a.startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const pet = a.patient?.name || 'Unknown pet';
      const doctorName = a.doctor?.name || 'TBD';
      const doctor = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;
      return `• ${date} ${time} — ${pet} with ${doctor}${a.reason ? ` (${a.reason})` : ''}`;
    });

    return {
      text: `Upcoming Appointments:\n${lines.join('\n')}\n\nType "menu" to see options.`,
    };
  }
}
