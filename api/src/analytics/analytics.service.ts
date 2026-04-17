import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalPatients,
      totalOwners,
      totalAppointments,
      todayAppointments,
      pendingLabResults,
      appointmentsByStatus,
      recentAppointments,
      patientsBySpecies,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.owner.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: {
          startsAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.labResult.count({
        where: {
          status: {
            in: ['pending', 'abnormal', 'critical'],
          },
        },
      }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          startsAt: 'desc',
        },
        take: 30,
        include: {
          patient: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.patient.groupBy({
        by: ['species'],
        _count: {
          species: true,
        },
      }),
    ]);

    const appointmentsThisMonth = await this.prisma.appointment.count({
      where: {
        startsAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const appointmentsLastMonth = await this.prisma.appointment.count({
      where: {
        startsAt: {
          gte: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo,
        },
      },
    });

    const appointmentGrowth = appointmentsLastMonth > 0
      ? ((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth) * 100
      : 0;

    const statusMap = appointmentsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    const speciesMap = patientsBySpecies.reduce((acc, curr) => {
      acc[curr.species || 'Unknown'] = curr._count.species;
      return acc;
    }, {} as Record<string, number>);

    const dailyAppointments = recentAppointments.reduce((acc, appointment) => {
      const date = appointment.startsAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const appointmentsTrend = Object.entries(dailyAppointments)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      overview: {
        totalPatients,
        totalOwners,
        totalAppointments,
        todayAppointments,
        pendingLabResults,
        appointmentGrowth: Math.round(appointmentGrowth * 10) / 10,
      },
      appointmentsByStatus: {
        scheduled: statusMap.scheduled || 0,
        completed: statusMap.completed || 0,
        cancelled: statusMap.cancelled || 0,
        noShow: statusMap.noShow || 0,
      },
      patientsBySpecies: speciesMap,
      appointmentsTrend,
      recentActivity: recentAppointments.slice(0, 10).map(a => ({
        id: a.id,
        date: a.startsAt,
        patientName: a.patient?.name || 'Unknown',
        reason: a.reason,
        status: a.status,
      })),
    };
  }

  async getAppointmentsAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: startDate,
        },
      },
      select: {
        startsAt: true,
        status: true,
        doctorId: true,
      },
    });

    const byDay: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byDoctor: Record<string, number> = {};

    appointments.forEach(apt => {
      const day = apt.startsAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;

      byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;

      if (apt.doctorId) {
        byDoctor[apt.doctorId] = (byDoctor[apt.doctorId] || 0) + 1;
      }
    });

    const dailyTrend = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: appointments.length,
      dailyTrend,
      byStatus,
      byDoctor,
    };
  }

  async getPatientDemographics() {
    const [bySpecies, byAge, total] = await Promise.all([
      this.prisma.patient.groupBy({
        by: ['species'],
        _count: {
          species: true,
        },
      }),
      this.prisma.patient.findMany({
        select: {
          birthdate: true,
        },
      }),
      this.prisma.patient.count(),
    ]);

    const speciesData = bySpecies.reduce((acc, curr) => {
      acc[curr.species || 'Unknown'] = curr._count.species;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const ageGroups = {
      puppy: 0,
      young: 0,
      adult: 0,
      senior: 0,
    };

    byAge.forEach(patient => {
      if (!patient.birthdate) {
        ageGroups.adult++;
        return;
      }

      const ageInYears = (now.getTime() - patient.birthdate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      if (ageInYears < 1) {
        ageGroups.puppy++;
      } else if (ageInYears < 3) {
        ageGroups.young++;
      } else if (ageInYears < 8) {
        ageGroups.adult++;
      } else {
        ageGroups.senior++;
      }
    });

    return {
      total,
      bySpecies: speciesData,
      byAgeGroup: ageGroups,
    };
  }
}
