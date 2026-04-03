import { Module } from '@nestjs/common';
import {
  InvoicesController,
  InvoiceGenerationController,
  PaymentsController,
  ReportsController,
} from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [
    InvoicesController,
    InvoiceGenerationController,
    PaymentsController,
    ReportsController,
  ],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
