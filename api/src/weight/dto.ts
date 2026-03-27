import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

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

export interface WeightRecordResponse {
  id: string;
  weight: number;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeightTrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  message: string;
}

export interface WeightSummary {
  current: number | null;
  previous: number | null;
  trend: WeightTrend | null;
  records: WeightRecordResponse[];
}
