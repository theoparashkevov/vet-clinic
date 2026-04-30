import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  value!: string;
}

export class BatchUpdateSettingsDto {
  @IsObject()
  settings!: Record<string, string>;
}
