import { IsDateString, IsOptional, IsString } from 'class-validator';

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
 * - microchipId: Microchip identification number
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

  /** Microchip ID - For identification and lost pet recovery */
  @IsString()
  @IsOptional()
  microchipId?: string;

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
  microchipId?: string;

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
