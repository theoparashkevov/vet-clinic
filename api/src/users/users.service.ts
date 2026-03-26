import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listDoctors() {
    return this.prisma.user.findMany({
      where: { role: 'doctor' },
      orderBy: { name: 'asc' },
    });
  }
}
