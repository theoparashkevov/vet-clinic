import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums (as const for TypeScript, strings for DB)
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const ServiceType = {
  CONSULTATION: 'CONSULTATION',
  PROCEDURE: 'PROCEDURE',
  MEDICATION: 'MEDICATION',
  VACCINATION: 'VACCINATION',
  LAB_TEST: 'LAB_TEST',
  SUPPLY: 'SUPPLY',
  BOARDING: 'BOARDING',
  OTHER: 'OTHER',
} as const;
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  CASH: 'CASH',
  CHECK: 'CHECK',
  BANK_TRANSFER: 'BANK_TRANSFER',
  STRIPE: 'STRIPE',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Invoice Item DTO
export class CreateInvoiceItemDto {
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @IsString()
  @IsOptional()
  inventoryItemId?: string;

  @IsString()
  @IsOptional()
  prescriptionId?: string;
}

export class UpdateInvoiceItemDto {
  @IsEnum(ServiceType)
  @IsOptional()
  serviceType?: ServiceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  unitPrice?: number;
}

// Invoice DTOs
export class CreateInvoiceDto {
  @IsString()
  patientId!: string;

  @IsString()
  ownerId!: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsDateString()
  dueDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  @Type(() => Number)
  taxRate?: number;
}

export class UpdateInvoiceDto {
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceItemDto)
  @IsOptional()
  items?: UpdateInvoiceItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  @Type(() => Number)
  taxRate?: number;
}

// Payment DTOs
export class CreatePaymentIntentDto {
  @IsString()
  invoiceId!: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}

export class ConfirmPaymentDto {
  @IsString()
  invoiceId!: string;

  @IsString()
  stripePaymentIntentId!: string;
}

export class RecordOfflinePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RefundPaymentDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

// Filter DTOs
export class InvoiceFilterDto {
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  overdue?: boolean;

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

export class RevenueReportFilterDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsOptional()
  groupBy?: 'day' | 'week' | 'month' | 'serviceType';
}

export class OutstandingInvoicesFilterDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  daysOverdue?: number;

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

export class GenerateFromAppointmentDto {
  @IsString()
  appointmentId!: string;
}

export class TopServicesFilterDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
