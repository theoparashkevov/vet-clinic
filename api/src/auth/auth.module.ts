import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SuperAdminGuard } from './superadmin.guard';

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET ?? (isProduction ? undefined : 'dev-only-secret');
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '8h') as `${number}h` | `${number}d` | `${number}s` | number;

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, SuperAdminGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, SuperAdminGuard, JwtModule],
})
export class AuthModule {}
