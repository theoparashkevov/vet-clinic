import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryCategory {
  VACCINE = 'VACCINE',
  MEDICATION = 'MEDICATION',
  SUPPLY = 'SUPPLY',
  FOOD = 'FOOD',
  EQUIPMENT = 'EQUIPMENT',
}

export enum TransactionType {
  RECEIVED = 'RECEIVED',
  DISPENSED = 'DISPENSED',
  ADJUSTED = 'ADJUSTED',
  EXPIRED = 'EXPIRED',
  RETURNED = 'RETURNED',
}

export class CreateInventoryItemDto {
  @IsString()
  name!: string;

  @IsEnum(InventoryCategory)
  category!: InventoryCategory;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minQuantity?: number;

  @IsString()
  unit!: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  lotNumber?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  supplierSku?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  costPerUnit?: number;

  @IsString()
  @IsOptional()
  medicationTemplateId?: string;
}

export class UpdateInventoryItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(InventoryCategory)
  @IsOptional()
  category?: InventoryCategory;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minQuantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  lotNumber?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  supplierSku?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  costPerUnit?: number;

  @IsString()
  @IsOptional()
  medicationTemplateId?: string;
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsString()
  @IsOptional()
  prescriptionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class InventoryFilterDto {
  @IsEnum(InventoryCategory)
  @IsOptional()
  category?: InventoryCategory;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  lowStock?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class UsageReportFilterDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
