import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffAccess } from '../auth/staff-access.decorator';

@StaffAccess()
@Controller('medication-templates')
export class MedicationTemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.medicationTemplate.findMany({
      orderBy: [
        { isCommon: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}
