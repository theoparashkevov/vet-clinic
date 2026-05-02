import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffAccess } from '../auth/staff-access.decorator';

@StaffAccess()
@Controller('service-catalog')
export class ServiceCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('limit') limit?: string) {
    const take = limit ? Math.min(parseInt(limit, 10), 1000) : 100;
    const items = await this.prisma.serviceCatalog.findMany({
      where: { isActive: true },
      orderBy: [{ serviceType: 'asc' }, { name: 'asc' }],
      take,
    });
    return { data: items };
  }
}
