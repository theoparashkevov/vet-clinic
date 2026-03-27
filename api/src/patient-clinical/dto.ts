import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class CreatePatientAlertDto {
  @IsEnum(['allergy', 'chronic_condition', 'medication', 'behavioral', 'other'])
  type!: string;

  @IsEnum(['critical', 'warning', 'info'])
  severity!: string;

  @IsString()
  description!: string;
}

export class UpdatePatientAlertDto {
  @IsEnum(['allergy', 'chronic_condition', 'medication', 'behavioral', 'other'])
  @IsOptional()
  type?: string;

  @IsEnum(['critical', 'warning', 'info'])
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateVaccinationDto {
  @IsString()
  type!: string;

  @IsString()
  name!: string;

  @IsDateString()
  givenDate!: string;

  @IsDateString()
  dueDate!: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsString()
  @IsOptional()
  veterinarian?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVaccinationDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  givenDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsString()
  @IsOptional()
  veterinarian?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateWeightRecordDto {
  @IsNumber()
  weight!: number;

  @IsDateString()
  date!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateWeightRecordDto {
  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
