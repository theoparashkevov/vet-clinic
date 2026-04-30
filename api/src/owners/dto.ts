import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateOwnerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
