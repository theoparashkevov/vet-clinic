import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export class CreateFollowUpReminderDto {
  @IsString()
  patientId!: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsEnum(['lab_results', 'recheck', 'surgery_followup', 'medication', 'custom'])
  type!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate!: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsBoolean()
  @IsOptional()
  notifyClient?: boolean;
}

export class UpdateFollowUpReminderDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(['pending', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;
}

export class CreateFromAppointmentDto {
  @IsEnum(['lab_results', 'recheck', 'surgery_followup', 'medication', 'custom'])
  type!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate!: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;
}
