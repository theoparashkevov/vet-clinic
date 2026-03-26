import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
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
}
