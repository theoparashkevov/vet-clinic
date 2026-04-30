import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds!: string[];
}
