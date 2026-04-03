import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateTransactionDto,
  InventoryFilterDto,
  UsageReportFilterDto,
} from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@StaffAccess()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  findAll(@Query() filters: InventoryFilterDto) {
    return this.inventory.findAll(filters);
  }

  @Post()
  create(@Body() dto: CreateInventoryItemDto) {
    return this.inventory.create(dto);
  }

  @Get('alerts/low-stock')
  getLowStockAlerts() {
    return this.inventory.getLowStockAlerts();
  }

  @Get('alerts/expiring')
  getExpiringAlerts(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.inventory.getExpiringAlerts(daysNum);
  }

  @Get('reports/usage')
  getUsageReport(@Query() filters: UsageReportFilterDto) {
    return this.inventory.getUsageReport(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventory.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventory.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventory.remove(id);
  }

  @Post(':id/transactions')
  createTransaction(
    @Param('id') id: string,
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.inventory.createTransaction(id, dto, user.sub);
  }
}
