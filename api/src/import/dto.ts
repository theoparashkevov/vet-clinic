import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CsvLabPanelDto {
  @IsString()
  name!: string;

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
  isCommon?: boolean | string;
}

export class CsvLabTestDto {
  @IsString()
  panelName!: string;

  @IsString()
  name!: string;

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

export class CsvMedicationTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  category?: string;

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

  @IsOptional()
  isCommon?: boolean | string;
}

export class CsvNoteTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  isCommon?: boolean | string;
}

export class ImportLabPanelsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CsvLabPanelDto)
  data!: CsvLabPanelDto[];
}

export class ImportLabTestsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CsvLabTestDto)
  data!: CsvLabTestDto[];
}

export class ImportMedicationTemplatesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CsvMedicationTemplateDto)
  data!: CsvMedicationTemplateDto[];
}

export class ImportNoteTemplatesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CsvNoteTemplateDto)
  data!: CsvNoteTemplateDto[];
}