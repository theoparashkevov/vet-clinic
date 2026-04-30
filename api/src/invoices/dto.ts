import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded',
] as const;

export const PAYMENT_METHODS = [
  'credit_card',
  'debit_card',
  'cash',
  'check',
  'bank_transfer',
] as const;

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;

export class CreateInvoiceItemDto {
  @IsString()
  @IsOptional()
  serviceCatalogId?: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @IsString()
  @IsOptional()
  serviceType?: string;
}

export class CreateInvoiceDto {
  @IsString()
  patientId!: string;

  @IsString()
  ownerId!: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsIn(INVOICE_STATUSES)
  @IsOptional()
  status?: string;

  @IsString()
  issueDate!: string;

  @IsString()
  dueDate!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  createdById!: string;

  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}

export class UpdateInvoiceDto {
  @IsString()
  @IsIn(INVOICE_STATUSES)
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  issueDate?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discountAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @IsOptional()
  items?: CreateInvoiceItemDto[];
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  processedById?: string;
}

export class ListInvoicesQuery {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
