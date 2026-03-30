import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { CsvImportService } from './csv-import.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImportController],
  providers: [CsvImportService],
})
export class ImportModule {}
