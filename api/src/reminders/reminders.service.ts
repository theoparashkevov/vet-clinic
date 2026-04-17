import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpReminderDto, UpdateFollowUpReminderDto, CreateFromAppointmentDto } from './dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: {
    patientId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    dueBefore?: string;
  }) {
    const where: Prisma.FollowUpReminderWhereInput = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.dueBefore) {
      where.dueDate = { lte: new Date(filters.dueBefore) };
    }

    return this.prisma.followUpReminder.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        appointment: {
          select: {
            id: true,
            startsAt: true,
            reason: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });
  }

  async getMyReminders(userId: string) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reminders = await this.prisma.followUpReminder.findMany({
      where: {
        assignedTo: userId,
        status: { in: ['pending', 'overdue'] },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    // Categorize reminders
    const today = reminders.filter(r => {
      const due = new Date(r.dueDate);
      return due.toDateString() === now.toDateString();
    });

    const upcoming = reminders.filter(r => {
      const due = new Date(r.dueDate);
      return due > now && due < tomorrow && !today.includes(r);
    });

    const overdue = reminders.filter(r => new Date(r.dueDate) < now);

    return { today, upcoming, overdue, all: reminders };
  }

  async create(dto: CreateFollowUpReminderDto, userId?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.followUpReminder.create({
      data: {
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        priority: dto.priority || 'normal',
        assignedTo: dto.assignedTo || userId,
        notifyClient: dto.notifyClient || false,
        status: 'pending',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });
  }

  async createFromAppointment(
    appointmentId: string,
    dto: CreateFromAppointmentDto,
    userId?: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.followUpReminder.create({
      data: {
        patientId: appointment.patientId,
        appointmentId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        priority: dto.priority || 'normal',
        assignedTo: userId,
        status: 'pending',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateFollowUpReminderDto, userId?: string) {
    const existing = await this.prisma.followUpReminder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Reminder not found');
    }

    const data: Prisma.FollowUpReminderUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assignedTo !== undefined) data.assignedTo = dto.assignedTo;
    if (dto.priority !== undefined) data.priority = dto.priority;

    if (dto.status === 'completed') {
      data.completedAt = new Date();
      data.completedBy = userId;
    }

    return this.prisma.followUpReminder.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });
  }

  async complete(id: string, userId: string) {
    return this.update(id, { status: 'completed' }, userId);
  }

  async remove(id: string) {
    const existing = await this.prisma.followUpReminder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Reminder not found');
    }

    await this.prisma.followUpReminder.delete({ where: { id } });
    return { ok: true };
  }

  async getStats(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalPending,
      overdue,
      dueToday,
      highPriority,
    ] = await Promise.all([
      this.prisma.followUpReminder.count({
        where: {
          assignedTo: userId,
          status: { in: ['pending', 'overdue'] },
        },
      }),
      this.prisma.followUpReminder.count({
        where: {
          assignedTo: userId,
          status: 'pending',
          dueDate: { lt: now },
        },
      }),
      this.prisma.followUpReminder.count({
        where: {
          assignedTo: userId,
          status: { in: ['pending', 'overdue'] },
          dueDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      }),
      this.prisma.followUpReminder.count({
        where: {
          assignedTo: userId,
          status: { in: ['pending', 'overdue'] },
          priority: { in: ['high', 'urgent'] },
        },
      }),
    ]);

    return { totalPending, overdue, dueToday, highPriority };
  }
}
