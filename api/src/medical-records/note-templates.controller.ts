import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffAccess } from '../auth/staff-access.decorator';

export interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  isCommon: boolean;
}

@StaffAccess()
@Controller('note-templates')
export class NoteTemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(): Promise<NoteTemplate[]> {
    return this.prisma.noteTemplate.findMany({
      orderBy: [
        { isCommon: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}
