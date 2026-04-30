import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(['pending', 'in_progress', 'completed'])
  @IsOptional()
  status?: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(['pending', 'in_progress', 'completed'])
  @IsOptional()
  status?: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;
}
