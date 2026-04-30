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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, CreatePaymentDto, ListInvoicesQuery, UpdateInvoiceDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@StaffAccess()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  list(@Query() query: ListInvoicesQuery) {
    return this.invoices.list(
      {
        patientId: query.patientId,
        status: query.status,
        fromDate: query.fromDate,
        toDate: query.toDate,
      },
      { page: query.page, limit: query.limit },
    );
  }

  @Post()
  @Roles('admin', 'doctor', 'registrar')
  async create(@Body() dto: CreateInvoiceDto) {
    const invoice = await this.invoices.create(dto);
    return { data: invoice };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const invoice = await this.invoices.get(id);
    return { data: invoice };
  }

  @Put(':id')
  @Roles('admin', 'doctor', 'registrar')
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    const invoice = await this.invoices.update(id, dto);
    return { data: invoice };
  }

  @Delete(':id')
  @Roles('admin', 'doctor', 'registrar')
  async void(@Param('id') id: string) {
    const invoice = await this.invoices.void(id);
    return { data: invoice };
  }

  @Post(':id/payments')
  @Roles('admin', 'doctor', 'registrar')
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    const result = await this.invoices.recordPayment(id, dto);
    return { data: result };
  }
}
