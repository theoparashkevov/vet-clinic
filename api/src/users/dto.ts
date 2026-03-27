import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_ROLES } from '../auth/roles.constants';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(Object.values(USER_ROLES))
  role!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsIn(Object.values(USER_ROLES))
  @IsOptional()
  role?: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
