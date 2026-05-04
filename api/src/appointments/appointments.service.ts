import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { publicUserSelect } from '../users/user-selects';
import { createPaginatedResult, getPaginationParams, PaginatedResult } from '../common/pagination';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertValidTimeWindow(startsAt: Date, endsAt: Date) {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid startsAt/endsAt');
    }

    if (startsAt >= endsAt) {
      throw new BadRequestException('startsAt must be before endsAt');
    }
  }

  private async assertNoOverlappingAppointments(params: {
    startsAt: Date;
    endsAt: Date;
    patientId: string;
    doctorId?: string | null;
    excludeId?: string;
  }) {
    const { startsAt, endsAt, patientId, doctorId, excludeId } = params;

    const or: Prisma.AppointmentWhereInput[] = [{ patientId }];
    if (doctorId) or.push({ doctorId });

    const where: Prisma.AppointmentWhereInput = {
      status: { notIn: ['cancelled', 'no_show', 'rescheduled'] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      OR: or,
    };

    const overlapping = await this.prisma.appointment.findFirst({
      where,
      select: { id: true },
    });

    if (overlapping) {
      throw new ConflictException('Appointment overlaps an existing booking');
    }
  }

  async list(
    filters: { date?: string; dateFrom?: string; dateTo?: string; doctorId?: string; status?: string; patientId?: string; ownerId?: string; patientName?: string; ownerName?: string },
    pagination?: { page?: string; limit?: string }
  ): Promise<PaginatedResult<any>> {
    const where: Record<string, unknown> = {};

    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.startsAt = { gte: start, lte: end };
    } else if (filters.dateFrom || filters.dateTo) {
      const range: Record<string, Date> = {};
      if (filters.dateFrom) {
        const start = new Date(filters.dateFrom);
        start.setHours(0, 0, 0, 0);
        range.gte = start;
      }
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        range.lte = end;
      }
      where.startsAt = range;
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.patientId) {
      where.patientId = filters.patientId;
    } else if (filters.patientName) {
      where.patient = { name: { contains: filters.patientName } };
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    } else if (filters.ownerName) {
      where.owner = { name: { contains: filters.ownerName } };
    }

    const { page, limit, skip } = getPaginationParams(pagination ?? {});

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          owner: true,
          doctor: { select: publicUserSelect },
        },
        orderBy: { startsAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  async get(id: string) {
    const found = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
    if (!found) throw new NotFoundException('Appointment not found');
    return found;
  }

  async create(dto: CreateAppointmentDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.assertValidTimeWindow(startsAt, endsAt);

    await this.assertNoOverlappingAppointments({
      startsAt,
      endsAt,
      patientId: dto.patientId,
      doctorId: dto.doctorId,
    });

    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        ownerId: dto.ownerId,
        doctorId: dto.doctorId,
        startsAt,
        endsAt,
        reason: dto.reason,
        room: dto.room,
        notes: dto.notes,
      },
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        doctorId: true,
        startsAt: true,
        endsAt: true,
        status: true,
      },
    });
    if (!existing) throw new NotFoundException('Appointment not found');

    const nextStartsAt = dto.startsAt !== undefined ? new Date(dto.startsAt) : existing.startsAt;
    const nextEndsAt = dto.endsAt !== undefined ? new Date(dto.endsAt) : existing.endsAt;
    const nextDoctorId = dto.doctorId !== undefined ? dto.doctorId : existing.doctorId;
    const nextStatus = dto.status !== undefined ? dto.status : existing.status;

    this.assertValidTimeWindow(nextStartsAt, nextEndsAt);

    const becomingBooked = !['cancelled', 'no_show', 'rescheduled'].includes(nextStatus);
    const wasCancelled = ['cancelled', 'no_show', 'rescheduled'].includes(existing.status);
    const needsOverlapCheck =
      becomingBooked &&
      (dto.startsAt !== undefined ||
        dto.endsAt !== undefined ||
        dto.doctorId !== undefined ||
        (wasCancelled && dto.status !== undefined && dto.status !== 'cancelled'));

    if (needsOverlapCheck) {
      await this.assertNoOverlappingAppointments({
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        patientId: existing.patientId,
        doctorId: nextDoctorId,
        excludeId: id,
      });
    }

    const data: Record<string, unknown> = {};
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === 'arrived' && existing.status !== 'arrived') {
        data.checkedInAt = new Date();
      }
      if (dto.status === 'completed' && existing.status !== 'completed') {
        data.checkedOutAt = new Date();
      }
      if (dto.status === 'cancelled' && existing.status !== 'cancelled') {
        data.cancelledAt = new Date();
      }
    }
    if (dto.reason !== undefined) data.reason = dto.reason;
    if (dto.startsAt !== undefined) data.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) data.endsAt = new Date(dto.endsAt);
    if (dto.doctorId !== undefined) data.doctorId = dto.doctorId;
    if (dto.room !== undefined) data.room = dto.room;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.checkedInAt !== undefined) data.checkedInAt = dto.checkedInAt ? new Date(dto.checkedInAt) : null;
    if (dto.checkedOutAt !== undefined) data.checkedOutAt = dto.checkedOutAt ? new Date(dto.checkedOutAt) : null;
    if (dto.cancelledBy !== undefined) data.cancelledBy = dto.cancelledBy;
    if (dto.cancellationReason !== undefined) data.cancellationReason = dto.cancellationReason;

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
  }

  async cancel(id: string, cancelledBy?: string, cancellationReason?: string) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Appointment not found');
    if (existing.status === 'cancelled') {
      throw new ConflictException('Appointment is already cancelled');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy,
        cancellationReason,
      },
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
  }

  async getSlots(date: string, doctorId?: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = {
      startsAt: { gte: dayStart, lte: dayEnd },
      status: { not: 'cancelled' },
    };
    if (doctorId) {
      where.doctorId = doctorId;
    }

    const booked = await this.prisma.appointment.findMany({
      where,
      select: { startsAt: true, endsAt: true },
    });

    const slots: string[] = [];
    const baseDate = new Date(date);

    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 17 && minute > 30) continue;
        const slotStart = new Date(baseDate);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        const overlaps = booked.some((appt) => {
          return slotStart < appt.endsAt && slotEnd > appt.startsAt;
        });

        if (!overlaps) {
          slots.push(slotStart.toISOString());
        }
      }
    }

    return { date, slots };
  }
}
