import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceFilterDto,
  RevenueReportFilterDto,
  OutstandingInvoicesFilterDto,
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  RecordOfflinePaymentDto,
  RefundPaymentDto,
  GenerateFromAppointmentDto,
  TopServicesFilterDto,
} from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@StaffAccess()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly billing: BillingService) {}

  @Get()
  list(@Query() filters: InvoiceFilterDto) {
    return this.billing.findAll(filters);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.billing.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser('userId') userId: string
  ) {
    return this.billing.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.billing.update(id, dto);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  send(@Param('id') id: string) {
    return this.billing.send(id);
  }

  @Post(':id/void')
  @HttpCode(HttpStatus.OK)
  void(@Param('id') id: string) {
    return this.billing.void(id);
  }

  @Get(':id/pdf')
  getPdf(@Param('id') id: string) {
    return this.billing.getPdf(id);
  }
}

@StaffAccess()
@Controller('invoices')
export class InvoiceGenerationController {
  constructor(private readonly billing: BillingService) {}

  @Post('generate-from-appointment')
  generateFromAppointment(
    @Body() dto: GenerateFromAppointmentDto,
    @CurrentUser('userId') userId: string
  ) {
    return this.billing.generateFromAppointment(dto.appointmentId, userId);
  }
}

@StaffAccess()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly billing: BillingService) {}

  @Post('create-intent')
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.billing.createPaymentIntent(dto.invoiceId);
  }

  @Post('confirm')
  confirm(@Body() dto: ConfirmPaymentDto) {
    return this.billing.confirmPayment(dto.invoiceId, dto.stripePaymentIntentId);
  }

  @Post('record-offline')
  recordOffline(
    @Body() dto: RecordOfflinePaymentDto,
    @CurrentUser('userId') userId: string
  ) {
    return this.billing.recordOfflinePayment(dto, userId);
  }

  @Post(':id/refund')
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto
  ) {
    return this.billing.refundPayment(id, dto);
  }
}

@StaffAccess()
@Controller('reports')
export class ReportsController {
  constructor(private readonly billing: BillingService) {}

  @Get('revenue')
  revenue(@Query() filters: RevenueReportFilterDto) {
    return this.billing.getRevenueReport(filters);
  }

  @Get('outstanding-invoices')
  outstanding(@Query() filters: OutstandingInvoicesFilterDto) {
    return this.billing.getOutstandingInvoices(filters);
  }

  @Get('top-services')
  topServices(@Query() filters: TopServicesFilterDto) {
    return this.billing.getTopServices(filters);
  }
}
