import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { authUserSelect, publicUserSelect } from './user-selects';
import { USER_ROLES } from '../auth/roles.constants';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listDoctors() {
    return this.prisma.user.findMany({
      where: { role: USER_ROLES.doctor },
      select: publicUserSelect,
      orderBy: { name: 'asc' },
    });
  }

  findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: authUserSelect,
    });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }
}
