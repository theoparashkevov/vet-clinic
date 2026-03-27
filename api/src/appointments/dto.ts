import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { APPOINTMENT_STATUSES } from './statuses';

export class CreateAppointmentDto {
  @IsString()
  patientId!: string;

  @IsString()
  ownerId!: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateAppointmentDto {
  @IsString()
  @IsIn(APPOINTMENT_STATUSES)
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;
}
