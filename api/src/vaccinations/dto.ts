import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateVaccinationDto {
  @IsString()
  name!: string;

  @IsString()
  type!: string;

  @IsDateString()
  administeredAt!: string;

  @IsDateString()
  dueDate!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVaccinationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsDateString()
  @IsOptional()
  administeredAt?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export type VaccinationStatus = 'current' | 'due-soon' | 'overdue';

export interface VaccinationResponse {
  id: string;
  name: string;
  administeredAt: string;
  dueDate: string;
  notes: string | null;
  status: VaccinationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationStatusSummary {
  status: VaccinationStatus;
  summary: {
    current: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  vaccinations: Array<{
    id: string;
    name: string;
    dueDate: string;
    status: VaccinationStatus;
  }>;
}
