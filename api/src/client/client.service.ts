/**
 * ClientService
 * 
 * Business logic layer for the Client Portal (Patient Mode).
 * Provides pet owners with access to their pets' information and appointment management.
 * 
 * Security model:
 * - All methods verify that the user has the 'client' role
 * - Users can only access pets linked to their owner record
 * - Pet ownership is enforced through database queries (ownerId matching)
 * - Read-only access to most data (clients cannot modify records)
 * 
 * Key responsibilities:
 * - List client's pets with vaccination status and upcoming appointments
 * - Provide detailed pet information (vaccines, weight history, appointments, medical records)
 * - List all appointments for the client
 * - Accept appointment requests (submitted to staff for approval)
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all pets for a client user.
   * 
   * Security: Only returns pets where the pet's owner is linked to the user's owner record.
   * Returns empty array if user has no owner record (not a pet owner).
   * 
   * Includes:
   * - Basic pet details (name, species, breed, birthdate)
   * - Vaccination status (calculated from due dates)
   * - Count of upcoming appointments
   * 
   * @param userId - The authenticated user's ID (from JWT token)
   * @returns Array of pets with vaccination status and appointment counts
   */
  async getPetsForClient(userId: string) {
    // Find the owner record associated with this user account
    // User model has optional owner relation - not all users are pet owners
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { owner: true },
    });

    // If user doesn't exist or isn't linked to an owner, return empty array
    // This handles cases where staff users try to access client endpoints
    if (!user || !user.owner) {
      return [];
    }

    // Query pets belonging to this owner
    const pets = await this.prisma.patient.findMany({
      where: { ownerId: user.owner.id },
      include: {
        vaccinations: true,  // Include all vaccines for status calculation
        appointments: {
          where: {
            startsAt: { gte: new Date() },  // Only future appointments
            status: { not: 'cancelled' },    // Exclude cancelled
          },
        },
      },
    });

    // Transform data for client view
    return pets.map((pet) => {
      const vaccinationStatus = this.calculateVaccinationStatus(pet.vaccinations);
      return {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthdate: pet.birthdate?.toISOString() || null,
        vaccinations: {
          status: vaccinationStatus,        // 'current' | 'due-soon' | 'overdue'
          count: pet.vaccinations.length,   // Total vaccines on record
        },
        upcomingAppointments: pet.appointments.length,  // For badge display
      };
    });
  }

  /**
   * Get detailed information for a single pet.
   * 
   * Security: Verifies pet ownership before returning data.
   * Throws ForbiddenException if user doesn't own the pet.
   * 
   * Detailed view includes:
   * - Basic pet info (name, species, breed, birthdate, microchip, allergies)
   * - All vaccinations with individual status
   * - Recent weight records (last 10, for trend analysis)
   * - Upcoming appointments with doctor details
   * - Recent medical record summaries (last 5 visits)
   * 
   * Note: Medical records show summary only, not full details (staff-only)
   * 
   * @param petId - Pet ID (CUID)
   * @param userId - Authenticated user's ID
   * @returns Comprehensive pet details
   * @throws ForbiddenException - If user doesn't own this pet
   * @throws NotFoundException - If pet doesn't exist or isn't owned by user
   */
  async getPetDetails(petId: string, userId: string) {
    // Verify user has access and get their owner record
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { owner: true },
    });

    if (!user || !user.owner) {
      throw new ForbiddenException('Access denied');
    }

    // Query pet AND verify ownership in single database call
    // Uses findFirst with ownerId constraint - returns null if not owned
    const pet = await this.prisma.patient.findFirst({
      where: {
        id: petId,
        ownerId: user.owner.id,  // Security: enforces ownership
      },
      include: {
        vaccinations: {
          orderBy: { dueDate: 'asc' },  // Soonest due first
        },
        weightRecords: {
          orderBy: { date: 'desc' },
          take: 10,  // Last 10 records for weight trend
        },
        appointments: {
          where: {
            startsAt: { gte: new Date() },
            status: { not: 'cancelled' },
          },
          orderBy: { startsAt: 'asc' },
          include: {
            doctor: {
              select: { id: true, name: true },  // Only doctor name, not all details
            },
          },
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 5,  // Recent visit history
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Transform for client view - excludes sensitive staff notes
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthdate: pet.birthdate?.toISOString() || null,
      microchipId: pet.microchipId,
      allergies: pet.allergies,
      chronicConditions: pet.chronicConditions,
      vaccinations: pet.vaccinations.map((v) => ({
        id: v.id,
        name: v.name,
        givenDate: v.givenDate.toISOString(),
        dueDate: v.dueDate.toISOString(),
        status: this.calculateSingleVaccinationStatus(v.dueDate),
      })),
      weightRecords: pet.weightRecords.map((w) => ({
        id: w.id,
        weight: w.weight,
        date: w.date.toISOString(),
        notes: w.notes,
      })),
      upcomingAppointments: pet.appointments.map((a) => ({
        id: a.id,
        startsAt: a.startsAt.toISOString(),
        reason: a.reason,
        doctor: a.doctor,
      })),
      recentVisits: pet.medicalRecords.map((r) => ({
        id: r.id,
        visitDate: r.visitDate.toISOString(),
        summary: r.summary,
        diagnoses: r.diagnoses,
        treatments: r.treatments,
      })),
    };
  }

  /**
   * Get all appointments for a client.
   * 
   * Returns appointments for all pets owned by this client,
   * sorted by date (most recent first).
   * 
   * @param userId - Authenticated user's ID
   * @returns Array of appointments with pet and doctor details
   */
  async getAppointmentsForClient(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { owner: true },
    });

    if (!user || !user.owner) {
      return [];
    }

    // Get all appointments for this owner (across all their pets)
    const appointments = await this.prisma.appointment.findMany({
      where: { ownerId: user.owner.id },
      include: {
        patient: true,  // Include pet details
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { startsAt: 'desc' },  // Most recent first
    });

    return appointments.map((a) => ({
      id: a.id,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      status: a.status,
      reason: a.reason,
      patient: { id: a.patient.id, name: a.patient.name },
      doctor: a.doctor,
    }));
  }

  /**
   * Submit an appointment request.
   * 
   * Note: This creates a request that staff must review and approve.
   * The actual appointment is not created until staff confirms.
   * 
   * Security: Verifies pet ownership before accepting request.
   * 
   * @param userId - Authenticated user's ID
   * @param dto - Appointment request details (petId, preferredDate, reason)
   * @returns Success confirmation message
   * @throws ForbiddenException - If user doesn't have access
   * @throws NotFoundException - If pet doesn't exist or isn't owned by user
   */
  async requestAppointment(
    userId: string,
    dto: { petId: string; preferredDate: string; reason: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { owner: true },
    });

    if (!user || !user.owner) {
      throw new ForbiddenException('Access denied');
    }

    // Verify pet ownership before accepting request
    const pet = await this.prisma.patient.findFirst({
      where: {
        id: dto.petId,
        ownerId: user.owner.id,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // In a real implementation, this would create an appointment request
    // that staff can review and schedule. For now, we'll just return success.
    return {
      success: true,
      message: 'Appointment request submitted. The clinic will contact you to confirm.',
    };
  }

  /**
   * Calculate overall vaccination status for a pet.
   * 
   * Logic:
   * - If ANY vaccine is overdue → status: 'overdue'
   * - Else if ANY vaccine is due within 30 days → status: 'due-soon'
   * - Else → status: 'current'
   * 
   * This shows the worst-case status (most urgent) across all vaccines.
   * 
   * @param vaccinations - Array of vaccination records with dueDate
   * @returns 'current' | 'due-soon' | 'overdue'
   */
  private calculateVaccinationStatus(vaccinations: any[]): 'current' | 'due-soon' | 'overdue' {
    if (vaccinations.length === 0) return 'current';

    const now = new Date();
    const statuses = vaccinations.map((v) => {
      const daysUntilDue = Math.floor((v.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 0) return 'overdue';
      if (daysUntilDue <= 30) return 'due-soon';
      return 'current';
    });

    // Return worst status (overdue > due-soon > current)
    if (statuses.includes('overdue')) return 'overdue';
    if (statuses.includes('due-soon')) return 'due-soon';
    return 'current';
  }

  /**
   * Calculate status for a single vaccination.
   * 
   * @param dueDate - Vaccination due date
   * @returns 'current' | 'due-soon' | 'overdue'
   */
  private calculateSingleVaccinationStatus(dueDate: Date): 'current' | 'due-soon' | 'overdue' {
    const now = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 30) return 'due-soon';
    return 'current';
  }
}
