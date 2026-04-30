import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto';
import { UsersService } from '../users/users.service';
import { AuthUser, CurrentAuthUser } from './auth.types';
import { verifyPassword } from './password';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(dto.email);

    if (!user?.passwordHash || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) ?? [];

    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      roles,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        roles,
        name: user.name,
      },
    };
  }

  async getCurrentUser(userId: string): Promise<CurrentAuthUser> {
    const user = await this.usersService.findPublicById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) ?? [];

    return {
      ...user,
      roles,
    };
  }
}
