import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Conversation state is tracked in-memory per session since the schema
// does not persist state/context fields on BotConversation.
const conversationState = new Map<string, { state: string; context: Record<string, unknown> }>();

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
      conversationState.set(conversation.id, { state: 'idle', context: {} });
    }

    // Attach in-memory state to the returned object
    const memState = conversationState.get(conversation.id) ?? { state: 'idle', context: {} };
    return Object.assign({}, conversation, { state: memState.state, context: memState.context });
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
    const conversation = await this.prisma.botConversation.findUnique({
      where: { id },
      include: { messages: true },
    });
    if (!conversation) return null;
    const memState = conversationState.get(id) ?? { state: 'idle', context: {} };
    return Object.assign({}, conversation, { state: memState.state, context: memState.context });
  }

  async updateConversationStatus(id: string, status: string) {
    return this.prisma.botConversation.update({
      where: { id },
      data: { status },
    });
  }

  async updateState(id: string, state: string, context?: Record<string, unknown>) {
    const existing = conversationState.get(id) ?? { state: 'idle', context: {} };
    conversationState.set(id, {
      state,
      context: context !== undefined ? context : existing.context,
    });
    const conversation = await this.prisma.botConversation.findUnique({ where: { id } });
    const memState = conversationState.get(id)!;
    return Object.assign({}, conversation, { state: memState.state, context: memState.context });
  }

  async linkOwner(id: string, ownerId: string) {
    return this.prisma.botConversation.update({
      where: { id },
      data: { ownerId },
    });
  }

  async getContext(id: string): Promise<Record<string, unknown>> {
    return conversationState.get(id)?.context ?? {};
  }

  async listMessages(conversationId: string) {
    return this.prisma.botMessage.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'asc' },
    });
  }
}
