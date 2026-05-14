import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: {
    userId: string;
    type: string;
    title: string;
    body: string;
    resourceType?: string;
    resourceId?: string;
  }) {
    return this.prisma.notification.create({ data: payload });
  }

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async dismiss(id: string, userId: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }

  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({ where: { userId } });
  }
}
