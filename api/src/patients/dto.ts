import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new patient.
 *
 * Required fields:
 * - ownerId: ID of the pet owner (must exist in Owner table)
 * - name: Pet's name
 * - species: Pet species (e.g., "Dog", "Cat", "Rabbit")
 *
 * Optional fields:
 * - breed: Pet breed (e.g., "Golden Retriever")
 * - birthdate: ISO 8601 date string (e.g., "2020-03-15")
 * - sex: Pet sex (e.g., "Male", "Female")
 * - isNeutered: Whether the pet is neutered/spayed
 * - color: Pet color/markings
 * - microchipId: Microchip identification number
 * - status: Patient status (default: "active")
 * - deceasedAt: ISO 8601 date string if deceased
 * - notes: General notes about the pet
 * - allergies: Known allergies (important for safety!)
 * - chronicConditions: Ongoing medical conditions
 *
 * @example
 * {
 *   ownerId: "cld123...",
 *   name: "Buddy",
 *   species: "Dog",
 *   breed: "Golden Retriever",
 *   birthdate: "2020-03-15",
 *   sex: "Male",
 *   isNeutered: true,
 *   color: "Golden",
 *   allergies: "Penicillin"
 * }
 */
export class CreatePatientDto {
  /**
   * Owner ID (CUID) - Links patient to their owner.
   * Must reference an existing Owner record.
   */
  @IsString()
  ownerId!: string;

  /** Pet's name - Displayed throughout the system */
  @IsString()
  name!: string;

  /**
   * Pet species - Used for vaccine protocols and care guidelines.
   * Examples: "Dog", "Cat", "Rabbit", "Bird"
   */
  @IsString()
  species!: string;

  /** Pet breed - Optional detail for records */
  @IsString()
  @IsOptional()
  breed?: string;

  /**
   * Birth date - ISO 8601 format (YYYY-MM-DD).
   * Used for age calculation and age-appropriate care.
   */
  @IsDateString()
  @IsOptional()
  birthdate?: string;

  /** Pet sex - "Male" or "Female" */
  @IsString()
  @IsOptional()
  sex?: string;

  /** Whether the pet is neutered/spayed */
  @IsBoolean()
  @IsOptional()
  isNeutered?: boolean;

  /** Pet color/markings */
  @IsString()
  @IsOptional()
  color?: string;

  /** Microchip ID - For identification and lost pet recovery */
  @IsString()
  @IsOptional()
  microchipId?: string;

  /** Patient status - "active", "inactive", "deceased" */
  @IsString()
  @IsOptional()
  status?: string;

  /** Date of death - ISO 8601 format (YYYY-MM-DD) */
  @IsDateString()
  @IsOptional()
  deceasedAt?: string;

  /** General notes - Any additional information about the pet */
  @IsString()
  @IsOptional()
  notes?: string;

  /**
   * Known allergies - CRITICAL for patient safety.
   * Displayed prominently in alerts and during appointments.
   * @example "Penicillin, Chicken"
   */
  @IsString()
  @IsOptional()
  allergies?: string;

  /**
   * Chronic conditions - Ongoing health issues.
   * @example "Asthma, Hip dysplasia"
   */
  @IsString()
  @IsOptional()
  chronicConditions?: string;
}

/**
 * Data Transfer Object for updating an existing patient.
 *
 * All fields are optional - only provided fields will be updated.
 * Use this for partial updates without affecting other data.
 *
 * @example
 * // Update only the allergies field
 * {
 *   allergies: "Penicillin, Beef"
 * }
 */
export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsString()
  @IsOptional()
  sex?: string;

  @IsBoolean()
  @IsOptional()
  isNeutered?: boolean;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  microchipId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  deceasedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  chronicConditions?: string;
}
