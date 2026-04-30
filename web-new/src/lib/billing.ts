import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchWithAuth } from "./api"

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled"
  | "refunded"

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "cash"
  | "check"
  | "bank_transfer"

export interface InvoiceItem {
  id: string
  invoiceId: string
  serviceCatalogId?: string
  description: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  totalPrice: number
  serviceType: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentMethod: string
  status: string
  transactionId?: string
  paidAt?: string
  notes?: string
  processedBy?: { name: string }
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  patientId: string
  ownerId: string
  appointmentId?: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  notes?: string
  createdById: string
  createdAt: string
  updatedAt: string
  patient?: { name: string; species: string }
  owner?: { name: string }
  items: InvoiceItem[]
  payments: Payment[]
}

export interface PaginatedInvoices {
  data: Invoice[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface InvoiceFilters {
  status?: string
  patientId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface CreateInvoiceItemDto {
  serviceCatalogId?: string
  description: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  serviceType?: string
}

export interface CreateInvoiceDto {
  patientId: string
  ownerId: string
  appointmentId?: string
  status?: string
  issueDate: string
  dueDate: string
  taxAmount?: number
  discountAmount?: number
  notes?: string
  createdById: string
  items: CreateInvoiceItemDto[]
}

export interface CreatePaymentDto {
  amount: number
  paymentMethod: PaymentMethod
  transactionId?: string
  notes?: string
  processedById?: string
}

export function useInvoices(filters: InvoiceFilters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set("status", filters.status)
  if (filters.patientId) params.set("patientId", filters.patientId)
  if (filters.fromDate) params.set("fromDate", filters.fromDate)
  if (filters.toDate) params.set("toDate", filters.toDate)
  if (filters.page) params.set("page", String(filters.page))
  if (filters.limit) params.set("limit", String(filters.limit))

  const queryString = params.toString()

  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async (): Promise<PaginatedInvoices> => {
      const res = await fetchWithAuth(`/v1/invoices?${queryString}`)
      return res as PaginatedInvoices
    },
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async (): Promise<Invoice> => {
      const res = await fetchWithAuth(`/v1/invoices/${id}`)
      return (res as { data: Invoice }).data
    },
    enabled: !!id,
  })
}

export function usePatientsForSelect() {
  return useQuery({
    queryKey: ["patients", "select"],
    queryFn: async () => {
      const res = await fetchWithAuth("/v1/patients?limit=1000")
      return (res as { data: { id: string; name: string; species: string; owner?: { id: string; name: string } }[] }).data ?? []
    },
  })
}

export function useServiceCatalog() {
  return useQuery({
    queryKey: ["service-catalog"],
    queryFn: async () => {
      const res = await fetchWithAuth("/v1/service-catalog?limit=1000")
      return (res as { data: { id: string; name: string; defaultPrice: number; serviceType: string }[] }).data ?? []
    },
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateInvoiceDto) => {
      const res = await fetchWithAuth("/v1/invoices", {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return (res as { data: Invoice }).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateInvoiceDto> }) => {
      const res = await fetchWithAuth(`/v1/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      })
      return (res as { data: Invoice }).data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] })
    },
  })
}

export function useVoidInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/v1/invoices/${id}`, {
        method: "DELETE",
      })
      return (res as { data: Invoice }).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: CreatePaymentDto }) => {
      const res = await fetchWithAuth(`/v1/invoices/${id}/payments`, {
        method: "POST",
        body: JSON.stringify(dto),
      })
      return (res as { data: Payment }).data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["invoices", variables.id] })
    },
  })
}

export function getInvoiceStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "paid":
      return "default"
    case "sent":
      return "secondary"
    case "partially_paid":
      return "secondary"
    case "draft":
      return "outline"
    case "overdue":
      return "destructive"
    case "cancelled":
      return "destructive"
    case "refunded":
      return "outline"
    default:
      return "outline"
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function calculateBalance(invoice: Invoice): number {
  const paid = invoice.payments?.reduce((sum, p) => {
    if (p.status === "completed" || p.status === "COMPLETED") {
      return sum + p.amount
    }
    return sum
  }, 0) ?? 0
  return Math.max(0, invoice.totalAmount - paid)
}
