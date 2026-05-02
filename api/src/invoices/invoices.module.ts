import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { ServiceCatalogController } from './service-catalog.controller';

@Module({
  controllers: [InvoicesController, ServiceCatalogController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
