import { IsDateString, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VitalSignsDto {
  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsInt()
  @IsOptional()
  heartRate?: number;

  @IsInt()
  @IsOptional()
  respiratoryRate?: number;

  @IsInt()
  @IsOptional()
  bloodPressureSystolic?: number;

  @IsInt()
  @IsOptional()
  bloodPressureDiastolic?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsInt()
  @IsOptional()
  bodyConditionScore?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateMedicalRecordDto {
  @IsString()
  patientId!: string;

  @IsDateString()
  visitDate!: string;

  @IsString()
  summary!: string;

  @IsString()
  @IsOptional()
  diagnoses?: string;

  @IsString()
  @IsOptional()
  treatments?: string;

  @IsString()
  @IsOptional()
  prescriptions?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsInt()
  @IsOptional()
  bodyConditionScore?: number;

  @IsDateString()
  @IsOptional()
  nextVisitRecommended?: string;

  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsOptional()
  vitalSigns?: VitalSignsDto;
}

export class UpdateMedicalRecordDto {
  @IsDateString()
  @IsOptional()
  visitDate?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  diagnoses?: string;

  @IsString()
  @IsOptional()
  treatments?: string;

  @IsString()
  @IsOptional()
  prescriptions?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsInt()
  @IsOptional()
  bodyConditionScore?: number;

  @IsDateString()
  @IsOptional()
  nextVisitRecommended?: string;

  @ValidateNested()
  @Type(() => VitalSignsDto)
  @IsOptional()
  vitalSigns?: VitalSignsDto;
}
