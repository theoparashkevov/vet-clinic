import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';

export class CreateLabPanelDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsOptional()
  isCommon?: boolean;
}

export class CreateLabTestDto {
  @IsString()
  panelId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  unit!: string;

  @IsNumber()
  @IsOptional()
  refRangeDogMin?: number;

  @IsNumber()
  @IsOptional()
  refRangeDogMax?: number;

  @IsNumber()
  @IsOptional()
  refRangeCatMin?: number;

  @IsNumber()
  @IsOptional()
  refRangeCatMax?: number;

  @IsNumber()
  @IsOptional()
  criticalLow?: number;

  @IsNumber()
  @IsOptional()
  criticalHigh?: number;

  @IsNumber()
  @IsOptional()
  warningLow?: number;

  @IsNumber()
  @IsOptional()
  warningHigh?: number;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class LabResultValueDto {
  @IsString()
  testId!: string;

  @IsNumber()
  value!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateLabResultDto {
  @IsString()
  patientId!: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  panelId!: string;

  @IsDateString()
  testDate!: string;

  @IsString()
  @IsOptional()
  externalLab?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  values!: LabResultValueDto[];
}

export class UpdateLabResultDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  reviewedDate?: string;

  @IsString()
  @IsOptional()
  reviewedBy?: string;

  @IsString()
  @IsOptional()
  interpretation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLabPanelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsOptional()
  isCommon?: boolean;
}

export class UpdateLabTestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  abbreviation?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  refRangeDogMin?: number;

  @IsNumber()
  @IsOptional()
  refRangeDogMax?: number;

  @IsNumber()
  @IsOptional()
  refRangeCatMin?: number;

  @IsNumber()
  @IsOptional()
  refRangeCatMax?: number;

  @IsNumber()
  @IsOptional()
  criticalLow?: number;

  @IsNumber()
  @IsOptional()
  criticalHigh?: number;

  @IsNumber()
  @IsOptional()
  warningLow?: number;

  @IsNumber()
  @IsOptional()
  warningHigh?: number;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
