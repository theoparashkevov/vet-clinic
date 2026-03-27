import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { publicUserSelect } from '../users/user-selects';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: { date?: string; doctorId?: string; status?: string; patientId?: string }) {
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

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        owner: true,
        doctor: { select: publicUserSelect },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async get(id: string) {
    const found = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
    if (!found) throw new NotFoundException('Appointment not found');
    return found;
  }

  create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        ownerId: dto.ownerId,
        doctorId: dto.doctorId,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        reason: dto.reason,
      },
      include: { patient: true, owner: true, doctor: { select: publicUserSelect } },
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.get(id);
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
