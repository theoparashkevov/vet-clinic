import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { PaginationQuery } from '../common/pagination';

/**
 * PatientsController
 * 
 * REST API controller for managing patient (pet) records in the vet clinic.
 * All endpoints require staff authentication via @StaffAccess decorator.
 * 
 * Base path: /v1/patients
 * 
 * Features:
 * - List patients with search and pagination
 * - Get single patient details
 * - Create new patients
 * - Update patient information
 * - Delete patients (with safety checks)
 */
@StaffAccess()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  /**
   * GET /v1/patients
   * 
   * List all patients with optional search and pagination.
   * 
   * @param search - Optional search term to filter by patient name or species
   * @param page - Optional page number (default: 1)
   * @param limit - Optional items per page (default: 10, max: 100)
   * @returns Paginated list of patients with their owners
   * 
   * @example
   * GET /v1/patients?search=rex&page=1&limit=10
   * Response: { data: [...], meta: { total: 50, page: 1, limit: 10, totalPages: 5 } }
   */
  @Get()
  list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.patients.list(search, { page, limit });
  }

  /**
   * GET /v1/patients/:id
   * 
   * Get detailed information for a single patient.
   * Includes owner details and related records.
   * 
   * @param id - Patient ID (CUID)
   * @returns Patient details with owner information
   * @throws NotFoundException if patient doesn't exist
   * 
   * @example
   * GET /v1/patients/cld123...
   * Response: { id: "...", name: "Rex", species: "Dog", owner: {...} }
   */
  @Get(':id')
  async get(@Param('id') id: string) {
    const patient = await this.patients.get(id);
    return { data: patient };
  }

  /**
   * POST /v1/patients
   * 
   * Create a new patient record.
   * Links the patient to an existing owner.
   * 
   * @param dto - Patient creation data (name, species, ownerId, optional fields)
   * @returns Created patient with owner details
   * @throws BadRequestException if validation fails
   * 
   * @example
   * POST /v1/patients
   * Body: { name: "Buddy", species: "Dog", breed: "Golden Retriever", ownerId: "..." }
   */
  @Post()
  async create(@Body() dto: CreatePatientDto) {
    const patient = await this.patients.create(dto);
    return { data: patient };
  }

  /**
   * PUT /v1/patients/:id
   * 
   * Update an existing patient's information.
   * All fields are optional - only provided fields are updated.
   * 
   * @param id - Patient ID (CUID)
   * @param dto - Patient update data (partial)
   * @returns Updated patient with owner details
   * @throws NotFoundException if patient doesn't exist
   * 
   * @example
   * PUT /v1/patients/cld123...
   * Body: { name: "Rex Updated", allergies: "Penicillin" }
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    const patient = await this.patients.update(id, dto);
    return { data: patient };
  }

  /**
   * DELETE /v1/patients/:id
   * 
   * Delete a patient record.
   * Safety: Cannot delete if patient has appointments or medical records (P2003 error).
   * 
   * @param id - Patient ID (CUID)
   * @returns Success object: { ok: true }
   * @throws NotFoundException if patient doesn't exist
   * @throws ConflictException if patient has linked records
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patients.remove(id);
  }
}
