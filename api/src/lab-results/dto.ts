import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateLabTestInPanelDto {
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

  @IsBoolean()
  @IsOptional()
  isCommon?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLabTestInPanelDto)
  @IsOptional()
  tests?: CreateLabTestInPanelDto[];
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

  @IsBoolean()
  @IsOptional()
  isCommon?: boolean;
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
  @Type(() => LabResultValueDto)
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

export class ListLabResultsQuery {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  panelId?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
