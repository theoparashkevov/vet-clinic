import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { createPaginatedResult, getPaginationParams, PaginatedResult } from '../common/pagination';

/**
 * PatientsService
 * 
 * Business logic layer for patient (pet) management.
 * Handles CRUD operations with proper error handling and relationships.
 * 
 * Key responsibilities:
 * - Patient CRUD with owner relationships
 * - Search functionality (name, species)
 * - Pagination support
 * - Safe deletion (prevents deletion if linked records exist)
 * - Date conversion for Prisma (string -> Date)
 */
@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List patients with optional search and pagination.
   * 
   * Search functionality:
   * - Case-insensitive search on name and species
   * - Uses Prisma's OR condition for broader matching
   * 
   * Pagination:
   * - Default: page 1, 10 items per page
   * - Max limit: 100 items per request
   * - Returns metadata: total count, current page, total pages
   * 
   * Ordering:
   * - Results sorted by creation date (newest first)
   * 
   * @param search - Optional search term for name/species
   * @param pagination - Optional { page, limit } for pagination
   * @returns PaginatedResult with patient data and owner details
   */
  async list(search?: string, pagination?: { page?: string; limit?: string }): Promise<PaginatedResult<any>> {
    // Build search filter - case-insensitive partial match on name OR species
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { species: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    // Parse and validate pagination parameters
    const { page, limit, skip } = getPaginationParams(pagination ?? {});

    // Execute query with count for pagination metadata
    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        include: { owner: true },  // Always include owner details
        orderBy: { createdAt: 'desc' },  // Newest patients first
        skip,  // Skip records for pagination
        take: limit,  // Limit results per page
      }),
      this.prisma.patient.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  /**
   * Get a single patient by ID.
   * 
   * Includes owner relationship for complete context.
   * Throws NotFoundException if patient doesn't exist.
   * 
   * @param id - Patient CUID
   * @returns Patient with owner details
   * @throws NotFoundException - If patient not found
   */
  async get(id: string) {
    const found = await this.prisma.patient.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!found) throw new NotFoundException('Patient not found');
    return found;
  }

  /**
   * Create a new patient record.
   * 
   * Date handling:
   * - Converts birthdate string to Date object for Prisma
   * - Undefined dates are stored as null
   * 
   * Owner validation:
   * - Relies on Prisma foreign key constraint (ownerId must exist)
   * - Throws P2003 error if owner doesn't exist
   * 
   * @param dto - Patient creation data
   * @returns Created patient with owner details
   */
  create(dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      },
      include: { owner: true },
    });
  }

  /**
   * Update an existing patient.
   * 
   * Validation:
   * - First checks if patient exists (throws NotFoundException if not)
   * - Only updates provided fields (partial update)
   * 
   * Date handling:
   * - Converts birthdate string to Date object
   * 
   * @param id - Patient CUID
   * @param dto - Partial patient update data
   * @returns Updated patient with owner details
   * @throws NotFoundException - If patient doesn't exist
   */
  async update(id: string, dto: UpdatePatientDto) {
    await this.get(id);  // Verify patient exists
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      },
      include: { owner: true },
    });
  }

  /**
   * Delete a patient record.
   * 
   * Safety mechanism:
   * - Cannot delete if patient has linked appointments (P2003 error)
   * - Cannot delete if patient has medical records (P2003 error)
   * - This prevents accidental data loss and maintains referential integrity
   * 
   * Error handling:
   * - P2003: Foreign key constraint failed (has linked records)
   * - Other errors: Re-thrown for handling upstream
   * 
   * @param id - Patient CUID
   * @returns Success indicator: { ok: true }
   * @throws NotFoundException - If patient doesn't exist
   * @throws ConflictException - If patient has linked records (P2003)
   */
  async remove(id: string) {
    await this.get(id);  // Verify patient exists

    try {
      await this.prisma.patient.delete({ where: { id } });
    } catch (error) {
      // P2003: Foreign key constraint violation
      // Patient has linked appointments or medical records
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Cannot delete patient with linked appointments or medical records');
      }

      throw error;  // Re-throw unexpected errors
    }

    return { ok: true };
  }
}
