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
      status: { not: 'cancelled' },
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
    filters: { date?: string; doctorId?: string; status?: string; patientId?: string },
    pagination?: { page?: string; limit?: string }
  ): Promise<PaginatedResult<any>> {
    const where: Record<string, unknown> = {};

    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.startsAt = { gte: start, lte: end };
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.patientId) {
      where.patientId = filters.patientId;
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

    const becomingBooked = nextStatus !== 'cancelled';
    const wasCancelled = existing.status === 'cancelled';
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
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.reason !== undefined) data.reason = dto.reason;
    if (dto.startsAt !== undefined) data.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) data.endsAt = new Date(dto.endsAt);
    if (dto.doctorId !== undefined) data.doctorId = dto.doctorId;

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
  }

  async remove(id: string) {
    await this.get(id);

    try {
      await this.prisma.appointment.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Cannot delete appointment with linked medical records');
      }

      throw error;
    }

    return { ok: true };
  }

  async getSlots(date: string, doctorId?: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Fetch existing appointments for this doctor on this date
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

    // Generate 30-minute slots from 09:00 to 17:30
    const slots: string[] = [];
    const baseDate = new Date(date);

    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 17 && minute > 30) continue;
        const slotStart = new Date(baseDate);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Check if this slot overlaps with any booked appointment
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
