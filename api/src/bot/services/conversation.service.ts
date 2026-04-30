import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(provider: string, externalId: string) {
    let conversation = await this.prisma.botConversation.findFirst({
      where: {
        viberUserId: externalId,
        status: 'active',
      },
    });

    if (!conversation) {
      conversation = await this.prisma.botConversation.create({
        data: {
          viberUserId: externalId,
          status: 'active',
        },
      });
    }

    return conversation;
  }

  async createMessage(data: {
    conversationId: string;
    direction: string;
    content: string;
    messageType?: string;
  }) {
    return this.prisma.botMessage.create({
      data: {
        conversationId: data.conversationId,
        direction: data.direction,
        content: data.content,
        messageType: data.messageType,
      },
    });
  }

  async findConversationById(id: string) {
    return this.prisma.botConversation.findUnique({
      where: { id },
      include: { messages: true },
    });
  }

  async updateConversationStatus(id: string, status: string) {
    return this.prisma.botConversation.update({
      where: { id },
      data: { status },
    });
  }

  async listMessages(conversationId: string) {
    return this.prisma.botMessage.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'asc' },
    });
  }
}
