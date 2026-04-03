import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateTransactionDto,
  InventoryFilterDto,
  UsageReportFilterDto,
  TransactionType,
} from './dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: InventoryFilterDto) {
    const { category, lowStock, search, page = 1, limit = 20 } = filters;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (lowStock) {
      where.quantity = {
        lt: this.prisma.inventoryItem.fields.minQuantity,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          medicationTemplate: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        medicationTemplate: {
          select: {
            id: true,
            name: true,
            category: true,
            dosage: true,
            frequency: true,
            duration: true,
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            prescription: {
              select: {
                id: true,
                medication: true,
                patientId: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async create(dto: CreateInventoryItemDto) {
    // Check for duplicate SKU if provided
    if (dto.sku) {
      const existing = await this.prisma.inventoryItem.findUnique({
        where: { sku: dto.sku },
      });
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
      }
    }

    // Validate medication template if provided
    if (dto.medicationTemplateId) {
      const template = await this.prisma.medicationTemplate.findUnique({
        where: { id: dto.medicationTemplateId },
      });
      if (!template) {
        throw new NotFoundException('Medication template not found');
      }

      // Check if template is already linked to another item
      const existingLink = await this.prisma.inventoryItem.findUnique({
        where: { medicationTemplateId: dto.medicationTemplateId },
      });
      if (existingLink) {
        throw new ConflictException(
          'Medication template is already linked to another inventory item'
        );
      }
    }

    const data: any = {
      name: dto.name,
      category: dto.category,
      sku: dto.sku,
      description: dto.description,
      quantity: dto.quantity ?? 0,
      minQuantity: dto.minQuantity ?? 10,
      unit: dto.unit,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
      lotNumber: dto.lotNumber,
      supplier: dto.supplier,
      supplierSku: dto.supplierSku,
      costPerUnit: dto.costPerUnit,
      medicationTemplateId: dto.medicationTemplateId,
    };

    return this.prisma.inventoryItem.create({
      data,
      include: {
        medicationTemplate: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    // Check for duplicate SKU if changing
    if (dto.sku && dto.sku !== item.sku) {
      const existing = await this.prisma.inventoryItem.findUnique({
        where: { sku: dto.sku },
      });
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
      }
    }

    // Validate medication template if provided
    if (dto.medicationTemplateId && dto.medicationTemplateId !== item.medicationTemplateId) {
      const template = await this.prisma.medicationTemplate.findUnique({
        where: { id: dto.medicationTemplateId },
      });
      if (!template) {
        throw new NotFoundException('Medication template not found');
      }

      // Check if template is already linked to another item
      const existingLink = await this.prisma.inventoryItem.findUnique({
        where: { medicationTemplateId: dto.medicationTemplateId },
      });
      if (existingLink && existingLink.id !== id) {
        throw new ConflictException(
          'Medication template is already linked to another inventory item'
        );
      }
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.sku !== undefined) data.sku = dto.sku;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.minQuantity !== undefined) data.minQuantity = dto.minQuantity;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.expirationDate !== undefined) {
      data.expirationDate = dto.expirationDate ? new Date(dto.expirationDate) : null;
    }
    if (dto.lotNumber !== undefined) data.lotNumber = dto.lotNumber;
    if (dto.supplier !== undefined) data.supplier = dto.supplier;
    if (dto.supplierSku !== undefined) data.supplierSku = dto.supplierSku;
    if (dto.costPerUnit !== undefined) data.costPerUnit = dto.costPerUnit;
    if (dto.medicationTemplateId !== undefined) {
      data.medicationTemplateId = dto.medicationTemplateId;
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data,
      include: {
        medicationTemplate: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (item.transactions.length > 0) {
      throw new BadRequestException(
        'Cannot delete inventory item with transaction history. Consider marking it as inactive instead.'
      );
    }

    await this.prisma.inventoryItem.delete({
      where: { id },
    });

    return { ok: true };
  }

  async createTransaction(
    inventoryItemId: string,
    dto: CreateTransactionDto,
    performedById: string
  ) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    // Validate prescription if provided for DISPENSED transactions
    if (dto.prescriptionId) {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: dto.prescriptionId },
      });
      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }
    }

    // Calculate new quantity based on transaction type
    let newQuantity = item.quantity;
    const quantity = dto.quantity;

    switch (dto.type) {
      case TransactionType.RECEIVED:
        newQuantity += quantity;
        break;

      case TransactionType.DISPENSED:
        newQuantity -= quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(
            `Insufficient stock. Current quantity: ${item.quantity}, requested: ${quantity}`
          );
        }
        break;

      case TransactionType.ADJUSTED:
        newQuantity = quantity;
        break;

      case TransactionType.EXPIRED:
        newQuantity -= quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(
            `Cannot expire more than current stock. Current quantity: ${item.quantity}, requested: ${quantity}`
          );
        }
        break;

      case TransactionType.RETURNED:
        newQuantity -= quantity;
        if (newQuantity < 0) {
          throw new BadRequestException(
            `Cannot return more than current stock. Current quantity: ${item.quantity}, requested: ${quantity}`
          );
        }
        break;

      default:
        throw new BadRequestException(`Invalid transaction type: ${dto.type}`);
    }

    // Execute transaction and update quantity atomically
    const [transaction] = await this.prisma.$transaction([
      this.prisma.inventoryTransaction.create({
        data: {
          inventoryItemId,
          type: dto.type,
          quantity: dto.quantity,
          prescriptionId: dto.prescriptionId,
          notes: dto.notes,
          performedById,
        },
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          prescription: {
            select: {
              id: true,
              medication: true,
              patientId: true,
            },
          },
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { quantity: newQuantity },
      }),
    ]);

    return transaction;
  }

  async getLowStockAlerts() {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lt: this.prisma.inventoryItem.fields.minQuantity,
        },
      },
      orderBy: {
        quantity: 'asc',
      },
      include: {
        medicationTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: items,
      count: items.length,
    };
  }

  async getExpiringAlerts(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const items = await this.prisma.inventoryItem.findMany({
      where: {
        expirationDate: {
          lte: cutoffDate,
          gte: new Date(),
        },
        quantity: {
          gt: 0,
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
      include: {
        medicationTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: items,
      count: items.length,
      cutoffDate: cutoffDate.toISOString(),
    };
  }

  async getUsageReport(filters: UsageReportFilterDto) {
    const { startDate, endDate } = filters;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get all DISPENSED transactions within date range
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        type: TransactionType.DISPENSED,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Aggregate usage by item
    const usageByItem = new Map();
    for (const tx of transactions) {
      const itemId = tx.inventoryItemId;
      if (!usageByItem.has(itemId)) {
        usageByItem.set(itemId, {
          itemId,
          name: tx.inventoryItem.name,
          category: tx.inventoryItem.category,
          unit: tx.inventoryItem.unit,
          totalQuantity: 0,
          transactionCount: 0,
        });
      }
      const item = usageByItem.get(itemId);
      item.totalQuantity += tx.quantity;
      item.transactionCount += 1;
    }

    return {
      data: Array.from(usageByItem.values()),
      summary: {
        totalTransactions: transactions.length,
        uniqueItems: usageByItem.size,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    };
  }
}
