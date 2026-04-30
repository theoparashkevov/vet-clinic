import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  medicationTemplateId?: string;

  @IsString()
  @IsOptional()
  medication?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(99)
  refillsTotal?: number;

  @IsBoolean()
  @IsOptional()
  isControlled?: boolean;

  @IsString()
  @IsOptional()
  veterinarian?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePrescriptionDto {
  @IsString()
  @IsOptional()
  medication?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  frequency?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsNumber()
  @IsOptional()
  refillsRemaining?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateFromTemplateDto {
  @IsString()
  templateId!: string;

  @IsDateString()
  expiresAt!: string;

  @IsString()
  @IsOptional()
  veterinarian?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
