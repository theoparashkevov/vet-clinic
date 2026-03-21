import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;
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
}
