import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, CreatePaymentDto, UpdateInvoiceDto } from './dto';
import { createPaginatedResult, getPaginationParams, PaginatedResult } from '../common/pagination';
import { publicUserSelect } from '../users/user-selects';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private generateInvoiceNumber(): string {
    const prefix = 'INV';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private calculateItemTotal(item: { unitPrice: number; quantity: number; discountAmount?: number | null }): number {
    return item.unitPrice * item.quantity - (item.discountAmount ?? 0);
  }

  private calculateInvoiceTotals(items: { unitPrice: number; quantity: number; discountAmount?: number | null }[], taxAmount = 0, discountAmount = 0) {
    const subtotal = items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
    const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);
    return { subtotal, totalAmount };
  }

  private async assertPatientAndOwnerExist(patientId: string, ownerId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, ownerId: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    if (patient.ownerId !== ownerId) {
      throw new BadRequestException('Patient does not belong to the specified owner');
    }
  }

  async list(
    filters: { patientId?: string; status?: string; fromDate?: string; toDate?: string },
    pagination?: { page?: string; limit?: string },
  ): Promise<PaginatedResult<any>> {
    const where: Record<string, unknown> = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.fromDate || filters.toDate) {
      where.issueDate = {};
      if (filters.fromDate) {
        (where.issueDate as Record<string, unknown>).gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        (where.issueDate as Record<string, unknown>).lte = new Date(filters.toDate);
      }
    }

    const { page, limit, skip } = getPaginationParams(pagination ?? {});

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true, species: true } },
          owner: { select: { id: true, name: true, phone: true } },
          appointment: { select: { id: true, startsAt: true, reason: true } },
          _count: { select: { items: true, payments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const enriched = data.map((invoice: any) => ({
      ...invoice,
      itemsCount: invoice._count.items,
      paymentsCount: invoice._count.payments,
      _count: undefined,
    }));

    return createPaginatedResult(enriched, total, page, limit);
  }

  async get(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, species: true } },
        owner: { select: { id: true, name: true, phone: true, email: true } },
        appointment: { select: { id: true, startsAt: true, reason: true } },
        items: true,
        payments: {
          include: {
            processedBy: { select: publicUserSelect },
          },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: { select: publicUserSelect },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const amountPaid = invoice.payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const balanceDue = Math.max(0, invoice.totalAmount - amountPaid);

    return {
      ...invoice,
      amountPaid,
      balanceDue,
    };
  }

  async create(dto: CreateInvoiceDto) {
    await this.assertPatientAndOwnerExist(dto.patientId, dto.ownerId);

    if (dto.appointmentId) {
      const appt = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
        select: { id: true, patientId: true },
      });
      if (!appt) throw new NotFoundException('Appointment not found');
      if (appt.patientId !== dto.patientId) {
        throw new BadRequestException('Appointment does not match the specified patient');
      }
    }

    const invoiceNumber = this.generateInvoiceNumber();

    const preparedItems = dto.items.map((item) => ({
      ...item,
      totalPrice: this.calculateItemTotal(item),
    }));

    const { subtotal, totalAmount } = this.calculateInvoiceTotals(
      preparedItems,
      dto.taxAmount ?? 0,
      dto.discountAmount ?? 0,
    );

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: dto.patientId,
        ownerId: dto.ownerId,
        appointmentId: dto.appointmentId,
        status: dto.status ?? 'draft',
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        subtotal,
        taxAmount: dto.taxAmount ?? 0,
        discountAmount: dto.discountAmount ?? 0,
        totalAmount,
        notes: dto.notes,
        createdById: dto.createdById,
        items: {
          create: preparedItems.map((item) => ({
            serviceCatalogId: item.serviceCatalogId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount ?? 0,
            totalPrice: item.totalPrice,
            serviceType: item.serviceType ?? 'OTHER',
          })),
        },
      },
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        items: true,
        payments: true,
      },
    });
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });
    if (!existing) throw new NotFoundException('Invoice not found');

    if (existing.status === 'cancelled') {
      throw new BadRequestException('Cannot update a cancelled invoice');
    }

    const data: Record<string, unknown> = {};

    if (dto.status !== undefined) data.status = dto.status;
    if (dto.issueDate !== undefined) data.issueDate = new Date(dto.issueDate);
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) data.notes = dto.notes;

    let preparedItems: Array<Record<string, unknown>> | undefined;
    let subtotal: number | undefined;
    let totalAmount: number | undefined;

    if (dto.items && dto.items.length > 0) {
      preparedItems = dto.items.map((item) => {
        const totalPrice = this.calculateItemTotal(item);
        return {
          serviceCatalogId: item.serviceCatalogId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount ?? 0,
          totalPrice,
          serviceType: item.serviceType ?? 'OTHER',
        };
      });

      const totals = this.calculateInvoiceTotals(
        dto.items,
        dto.taxAmount !== undefined ? dto.taxAmount : existing.taxAmount,
        dto.discountAmount !== undefined ? dto.discountAmount : existing.discountAmount,
      );
      subtotal = totals.subtotal;
      totalAmount = totals.totalAmount;
    } else if (dto.taxAmount !== undefined || dto.discountAmount !== undefined) {
      const items = existing.items;
      const totals = this.calculateInvoiceTotals(
        items,
        dto.taxAmount !== undefined ? dto.taxAmount : existing.taxAmount,
        dto.discountAmount !== undefined ? dto.discountAmount : existing.discountAmount,
      );
      subtotal = totals.subtotal;
      totalAmount = totals.totalAmount;
    }

    if (subtotal !== undefined) data.subtotal = subtotal;
    if (totalAmount !== undefined) data.totalAmount = totalAmount;
    if (dto.taxAmount !== undefined) data.taxAmount = dto.taxAmount;
    if (dto.discountAmount !== undefined) data.discountAmount = dto.discountAmount;

    const updateData: any = { ...data };
    if (preparedItems) {
      updateData.items = {
        deleteMany: {},
        create: preparedItems,
      };
    }

    const result = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { items: true, payments: true },
    });

    return result;
  }

  async void(id: string) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) throw new NotFoundException('Invoice not found');
    if (existing.status === 'cancelled') {
      throw new BadRequestException('Invoice is already cancelled');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        items: true,
        payments: true,
      },
    });
  }

  async recordPayment(id: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Cannot record payment on a cancelled invoice');
    }
    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already fully paid');
    }

    const amountPaidSoFar = invoice.payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    if (dto.amount > invoice.totalAmount - amountPaidSoFar) {
      throw new BadRequestException('Payment amount exceeds remaining balance');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: id,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: 'completed',
        transactionId: dto.transactionId,
        notes: dto.notes,
        processedById: dto.processedById,
        paidAt: new Date(),
      },
    });

    const newAmountPaid = amountPaidSoFar + dto.amount;
    const balanceDue = invoice.totalAmount - newAmountPaid;

    let newStatus = invoice.status;
    if (balanceDue <= 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    }

    if (newStatus !== invoice.status) {
      await this.prisma.invoice.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    return {
      payment,
      amountPaid: newAmountPaid,
      balanceDue: Math.max(0, balanceDue),
      status: newStatus,
    };
  }
}
