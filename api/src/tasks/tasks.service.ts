import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { createPaginatedResult, getPaginationParams } from '../common/pagination';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: {
    patientId?: string;
    appointmentId?: string;
    ownerId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    page?: string;
    limit?: string;
  }) {
    const where: Prisma.TaskWhereInput = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.appointmentId) where.appointmentId = filters.appointmentId;
    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const { page, limit, skip } = getPaginationParams({ page: filters.page, limit: filters.limit });

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true, species: true } },
          appointment: { select: { id: true, startsAt: true, reason: true } },
          owner: { select: { id: true, name: true, phone: true } },
          assignedToUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  async get(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, species: true } },
        appointment: { select: { id: true, startsAt: true, reason: true } },
        owner: { select: { id: true, name: true, phone: true } },
        assignedToUser: { select: { id: true, name: true, email: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async getAssigned(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { assignedTo: userId },
      include: {
        patient: { select: { id: true, name: true, species: true } },
        appointment: { select: { id: true, startsAt: true, reason: true } },
        owner: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });
    return { data: tasks };
  }

  async create(dto: CreateTaskDto, userId?: string) {
    const data: Prisma.TaskCreateInput = {
      title: dto.title,
      description: dto.description,
      type: dto.type || 'general',
      status: dto.status || 'pending',
      priority: dto.priority || 'normal',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    };

    if (dto.patientId) {
      const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
      if (!patient) throw new NotFoundException('Patient not found');
      data.patient = { connect: { id: dto.patientId } };
    }
    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId } });
      if (!appointment) throw new NotFoundException('Appointment not found');
      data.appointment = { connect: { id: dto.appointmentId } };
    }
    if (dto.ownerId) {
      const owner = await this.prisma.owner.findUnique({ where: { id: dto.ownerId } });
      if (!owner) throw new NotFoundException('Owner not found');
      data.owner = { connect: { id: dto.ownerId } };
    }
    if (dto.assignedTo) {
      const user = await this.prisma.user.findUnique({ where: { id: dto.assignedTo } });
      if (!user) throw new NotFoundException('Assigned user not found');
      data.assignedToUser = { connect: { id: dto.assignedTo } };
    }

    return this.prisma.task.create({
      data,
      include: {
        patient: { select: { id: true, name: true, species: true } },
        appointment: { select: { id: true, startsAt: true, reason: true } },
        owner: { select: { id: true, name: true, phone: true } },
        assignedToUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId?: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');

    const data: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);

    if (dto.patientId !== undefined) {
      if (dto.patientId) {
        const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
        if (!patient) throw new NotFoundException('Patient not found');
        data.patient = { connect: { id: dto.patientId } };
      } else {
        data.patient = { disconnect: true };
      }
    }
    if (dto.appointmentId !== undefined) {
      if (dto.appointmentId) {
        const appointment = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId } });
        if (!appointment) throw new NotFoundException('Appointment not found');
        data.appointment = { connect: { id: dto.appointmentId } };
      } else {
        data.appointment = { disconnect: true };
      }
    }
    if (dto.ownerId !== undefined) {
      if (dto.ownerId) {
        const owner = await this.prisma.owner.findUnique({ where: { id: dto.ownerId } });
        if (!owner) throw new NotFoundException('Owner not found');
        data.owner = { connect: { id: dto.ownerId } };
      } else {
        data.owner = { disconnect: true };
      }
    }
    if (dto.assignedTo !== undefined) {
      if (dto.assignedTo) {
        const user = await this.prisma.user.findUnique({ where: { id: dto.assignedTo } });
        if (!user) throw new NotFoundException('Assigned user not found');
        data.assignedToUser = { connect: { id: dto.assignedTo } };
      } else {
        data.assignedToUser = { disconnect: true };
      }
    }

    if (dto.status === 'completed' && existing.status !== 'completed') {
      data.completedAt = new Date();
      data.completedBy = userId;
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, name: true, species: true } },
        appointment: { select: { id: true, startsAt: true, reason: true } },
        owner: { select: { id: true, name: true, phone: true } },
        assignedToUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found');
    await this.prisma.task.delete({ where: { id } });
    return { ok: true };
  }
}
