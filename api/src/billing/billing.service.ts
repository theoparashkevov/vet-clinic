import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateInvoiceItemDto,
  InvoiceFilterDto,
  RevenueReportFilterDto,
  OutstandingInvoicesFilterDto,
  RecordOfflinePaymentDto,
  RefundPaymentDto,
  TopServicesFilterDto,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  ServiceType,
} from './dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}-${random}`;
  }

  private calculateTotals(
    items: { quantity: number; unitPrice: number }[],
    taxRate: number = 0
  ) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }

  private async ensureUniqueInvoiceNumber(): Promise<string> {
    let invoiceNumber: string;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      invoiceNumber = this.generateInvoiceNumber();
      const existing = await this.prisma.invoice.findUnique({
        where: { invoiceNumber },
      });
      exists = !!existing;
      attempts++;
    }

    if (exists) {
      throw new ConflictException('Could not generate unique invoice number');
    }

    return invoiceNumber!;
  }

  async findAll(filters: InvoiceFilterDto) {
    const {
      status,
      patientId,
      ownerId,
      startDate,
      endDate,
      overdue,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) {
        where.issueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.issueDate.lte = new Date(endDate);
      }
    }

    if (overdue) {
      where.status = { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] };
      where.dueDate = { lt: new Date() };
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { patient: { name: { contains: search } } },
        { owner: { name: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, name: true, species: true } },
          owner: { select: { id: true, name: true, email: true } },
          items: true,
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, species: true, breed: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
        appointment: { select: { id: true, startsAt: true, reason: true } },
        items: true,
        payments: {
          include: {
            processedBy: { select: { id: true, name: true } },
          },
        },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async create(dto: CreateInvoiceDto, createdById: string) {
    const { patientId, ownerId, appointmentId, dueDate, items, taxRate = 0 } = dto;

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const owner = await this.prisma.owner.findUnique({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
    }

    const invoiceNumber = await this.ensureUniqueInvoiceNumber();

    const itemsWithTotals = items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const { subtotal, taxAmount, total } = this.calculateTotals(
      itemsWithTotals,
      taxRate
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId,
        ownerId,
        appointmentId,
        dueDate: new Date(dueDate),
        status: InvoiceStatus.DRAFT,
        subtotal,
        taxRate,
        taxAmount,
        total,
        balanceDue: total,
        notes: dto.notes,
        terms: dto.terms,
        createdById,
        items: {
          create: itemsWithTotals,
        },
      },
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        items: true,
      },
    });

    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }

    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only update invoices in DRAFT status');
    }

    const updateData: any = {};

    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    if (dto.terms !== undefined) {
      updateData.terms = dto.terms;
    }

    let itemsWithTotals = existing.items;
    let taxRate = existing.taxRate;

    if (dto.taxRate !== undefined) {
      taxRate = dto.taxRate;
      updateData.taxRate = taxRate;
    }

    if (dto.items && dto.items.length > 0) {
      await this.prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      itemsWithTotals = dto.items.map((item) => ({
        ...item,
        id: '',
        invoiceId: id,
        total: (item.quantity || 1) * (item.unitPrice || 0),
        createdAt: new Date(),
      }));

      await this.prisma.invoiceItem.createMany({
        data: itemsWithTotals,
      });
    }

    const { subtotal, taxAmount, total } = this.calculateTotals(
      itemsWithTotals,
      taxRate
    );

    updateData.subtotal = subtotal;
    updateData.taxAmount = taxAmount;
    updateData.total = total;
    updateData.balanceDue = total - existing.amountPaid;

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        items: true,
      },
    });

    return invoice;
  }

  async send(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only send invoices in DRAFT status');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  }

  async void(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }

    const hasCompletedPayments = invoice.payments.some(
      (p: { status: string }) => p.status === PaymentStatus.COMPLETED
    );

    if (hasCompletedPayments) {
      throw new BadRequestException(
        'Cannot void an invoice with completed payments. Please refund instead.'
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        items: true,
      },
    });
  }

  async generateFromAppointment(appointmentId: string, createdById: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        owner: true,
        medicalRecords: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { appointmentId },
    });

    if (existingInvoice) {
      throw new ConflictException(
        'An invoice already exists for this appointment'
      );
    }

    const invoiceNumber = await this.ensureUniqueInvoiceNumber();

    const items: CreateInvoiceItemDto[] = [
      {
        serviceType: ServiceType.CONSULTATION,
        description: `Office visit: ${appointment.reason || 'General consultation'}`,
        quantity: 1,
        unitPrice: 75.0,
      },
    ];

    const { subtotal, taxAmount, total } = this.calculateTotals(items, 0);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        patientId: appointment.patientId,
        ownerId: appointment.ownerId,
        appointmentId,
        dueDate,
        status: InvoiceStatus.DRAFT,
        subtotal,
        taxRate: 0,
        taxAmount,
        total,
        balanceDue: total,
        createdById,
        items: {
          create: items.map((item) => ({
            ...item,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        patient: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
        items: true,
      },
    });

    return invoice;
  }

  async getPdf(id: string) {
    const invoice = await this.findOne(id);

    return {
      message: 'PDF generation not yet implemented',
      invoice,
    };
  }

  async createPaymentIntent(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.balanceDue <= 0) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    return {
      clientSecret: 'placeholder_secret',
      amount: invoice.balanceDue,
      currency: 'usd',
    };
  }

  async confirmPayment(invoiceId: string, stripePaymentIntentId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: invoice.balanceDue,
        method: PaymentMethod.STRIPE,
        status: PaymentStatus.COMPLETED,
        stripePaymentIntentId,
        processedAt: new Date(),
      },
    });

    const newAmountPaid = invoice.amountPaid + invoice.balanceDue;
    const newBalanceDue = invoice.total - newAmountPaid;
    const newStatus =
      newBalanceDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });

    return payment;
  }

  async recordOfflinePayment(
    dto: RecordOfflinePaymentDto,
    processedById: string
  ) {
    const { invoiceId, amount, method, notes } = dto;

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.balanceDue <= 0) {
      throw new BadRequestException('Invoice is already fully paid');
    }

    if (amount > invoice.balanceDue) {
      throw new BadRequestException(
        `Payment amount exceeds balance due. Balance: ${invoice.balanceDue}`
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        status: PaymentStatus.COMPLETED,
        processedAt: new Date(),
        processedById,
      },
    });

    const newAmountPaid = invoice.amountPaid + amount;
    const newBalanceDue = invoice.total - newAmountPaid;
    const newStatus =
      newBalanceDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });

    return payment;
  }

  async refundPayment(paymentId: string, dto: RefundPaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    const refundAmount = dto.amount || payment.amount;

    if (refundAmount > payment.amount - payment.refundedAmount) {
      throw new BadRequestException('Refund amount exceeds available amount');
    }

    const newRefundedAmount = payment.refundedAmount + refundAmount;
    const isFullyRefunded = newRefundedAmount >= payment.amount;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: newRefundedAmount,
        isRefunded: isFullyRefunded,
        status: isFullyRefunded ? PaymentStatus.REFUNDED : payment.status,
      },
    });

    const invoice = payment.invoice;
    const newAmountPaid = invoice.amountPaid - refundAmount;
    const newBalanceDue = invoice.total - newAmountPaid;

    let newStatus = invoice.status;
    if (newBalanceDue >= invoice.total) {
      newStatus = InvoiceStatus.SENT;
    } else if (newBalanceDue > 0) {
      newStatus = InvoiceStatus.PARTIAL;
    }

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });

    return {
      message: 'Refund processed successfully',
      refundAmount,
      paymentId,
    };
  }

  async getRevenueReport(filters: RevenueReportFilterDto) {
    const { startDate, endDate, groupBy = 'day' } = filters;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        issueDate: { gte: start, lte: end },
        status: { in: [InvoiceStatus.PAID, InvoiceStatus.PARTIAL] },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    const totalRevenue = invoices.reduce((sum: number, inv: { total: number }) => sum + inv.total, 0);
    const totalCollected = invoices.reduce(
      (sum: number, inv: { amountPaid: number }) => sum + inv.amountPaid,
      0
    );
    const totalOutstanding = totalRevenue - totalCollected;

    const breakdown: { label: string; revenue: number; collected: number }[] =
      [];

    if (groupBy === 'serviceType') {
      const byService = new Map<string, { revenue: number; collected: number }>();

      for (const invoice of invoices) {
        for (const item of invoice.items) {
          const existing = byService.get(item.serviceType) || {
            revenue: 0,
            collected: 0,
          };
          existing.revenue += item.total;
          const paymentRatio = invoice.total > 0 ? invoice.amountPaid / invoice.total : 0;
          existing.collected += item.total * paymentRatio;
          byService.set(item.serviceType, existing);
        }
      }

      for (const [label, data] of byService) {
        breakdown.push({ label, revenue: data.revenue, collected: data.collected });
      }
    } else {
      const dateFormat: Intl.DateTimeFormatOptions =
        groupBy === 'month'
          ? { year: 'numeric', month: 'short' }
          : groupBy === 'week'
          ? { year: 'numeric', month: 'short', day: 'numeric' }
          : { month: 'short', day: 'numeric' };

      const byDate = new Map<string, { revenue: number; collected: number }>();

      for (const invoice of invoices) {
        const label = invoice.issueDate.toLocaleDateString('en-US', dateFormat);
        const existing = byDate.get(label) || { revenue: 0, collected: 0 };
        existing.revenue += invoice.total;
        existing.collected += invoice.amountPaid;
        byDate.set(label, existing);
      }

      for (const [label, data] of byDate) {
        breakdown.push({ label, revenue: data.revenue, collected: data.collected });
      }
    }

    return {
      totalRevenue,
      totalCollected,
      totalOutstanding,
      breakdown,
    };
  }

  async getOutstandingInvoices(filters: OutstandingInvoicesFilterDto) {
    const { daysOverdue, page = 1, limit = 20 } = filters;

    const where: any = {
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      balanceDue: { gt: 0 },
    };

    if (daysOverdue !== undefined) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);
      where.dueDate = { lt: cutoffDate };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          patient: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTopServices(filters: TopServicesFilterDto) {
    const { startDate, endDate, limit = 10 } = filters;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const items = await this.prisma.invoiceItem.findMany({
      where: {
        invoice: {
          issueDate: { gte: start, lte: end },
          status: { in: [InvoiceStatus.PAID, InvoiceStatus.PARTIAL] },
        },
      },
      include: {
        invoice: true,
      },
    });

    const byService = new Map<
      string,
      { count: number; revenue: number }
    >();

    for (const item of items) {
      const existing = byService.get(item.serviceType) || {
        count: 0,
        revenue: 0,
      };
      existing.count += 1;
      const paymentRatio =
        item.invoice.total > 0 ? item.invoice.amountPaid / item.invoice.total : 0;
      existing.revenue += item.total * paymentRatio;
      byService.set(item.serviceType, existing);
    }

    const result = Array.from(byService.entries())
      .map(([serviceType, data]) => ({
        serviceType,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return result;
  }

  async checkAndUpdateOverdueStatus() {
    const now = new Date();

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] },
        dueDate: { lt: now },
      },
    });

    for (const invoice of overdueInvoices) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.OVERDUE },
      });
    }

    return {
      updatedCount: overdueInvoices.length,
    };
  }
}
