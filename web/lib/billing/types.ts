export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "PARTIAL"
  | "OVERDUE"
  | "CANCELLED"
  | "REFUNDED";

export type ServiceType =
  | "CONSULTATION"
  | "PROCEDURE"
  | "MEDICATION"
  | "VACCINATION"
  | "LAB_TEST"
  | "SUPPLY"
  | "BOARDING"
  | "OTHER";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "CHECK"
  | "BANK_TRANSFER"
  | "STRIPE";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceType: ServiceType;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  inventoryItemId?: string;
  prescriptionId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  processedAt?: string;
  receiptUrl?: string;
  failureMessage?: string;
  refundedAmount: number;
  isRefunded: boolean;
  processedById?: string;
  processedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId?: string;
  patientId: string;
  patient: {
    id: string;
    name: string;
    species: string;
    breed?: string;
  };
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface CreateInvoiceDto {
  patientId: string;
  ownerId: string;
  appointmentId?: string;
  dueDate: string;
  items: {
    serviceType: ServiceType;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
  taxRate?: number;
}

export interface UpdateInvoiceDto {
  dueDate?: string;
  items?: {
    id?: string;
    serviceType: ServiceType;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
  taxRate?: number;
}

export interface RecordPaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface RevenueReport {
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  breakdown: {
    label: string;
    revenue: number;
    collected: number;
  }[];
}

export interface InvoiceListResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  patientId?: string;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
  overdue?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  CONSULTATION: "Consultation",
  PROCEDURE: "Procedure",
  MEDICATION: "Medication",
  VACCINATION: "Vaccination",
  LAB_TEST: "Lab Test",
  SUPPLY: "Supply",
  BOARDING: "Boarding",
  OTHER: "Other",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  CASH: "Cash",
  CHECK: "Check",
  BANK_TRANSFER: "Bank Transfer",
  STRIPE: "Stripe",
};
