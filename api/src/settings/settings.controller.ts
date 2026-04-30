import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto, BatchUpdateSettingsDto } from './dto';
import { SuperAdminAccess } from '../auth/superadmin-access.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @SuperAdminAccess()
  @Get()
  list() {
    return this.settings.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':key')
  async get(@Param('key') key: string) {
    const setting = await this.settings.getByKey(key);
    return { data: setting };
  }

  @SuperAdminAccess()
  @Put(':key')
  async update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    const setting = await this.settings.update(key, dto.value);
    return { data: setting };
  }

  @SuperAdminAccess()
  @Put()
  async updateBatch(@Body() dto: BatchUpdateSettingsDto) {
    const settings = await this.settings.updateBatch(dto.settings);
    return { data: settings };
  }
}
