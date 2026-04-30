import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { STAFF_ROLES } from '../auth/roles.constants';
import { LabResultsService } from './lab-results.service';
import {
  CreateLabPanelDto,
  CreateLabResultDto,
  ListLabResultsQuery,
  UpdateLabPanelDto,
  UpdateLabResultDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
@Controller('lab-panels')
export class LabPanelsController {
  constructor(private readonly service: LabResultsService) {}

  @Get()
  list(@Query('species') species?: string) {
    return this.service.listPanels(species);
  }

  @Post()
  async create(@Body() dto: CreateLabPanelDto) {
    const panel = await this.service.createPanel(dto);
    return { data: panel };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLabPanelDto) {
    const panel = await this.service.updatePanel(id, dto);
    return { data: panel };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.deletePanel(id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
@Controller('lab-results')
export class LabResultsController {
  constructor(private readonly service: LabResultsService) {}

  @Get()
  list(@Query() query: ListLabResultsQuery) {
    return this.service.listResults(query);
  }

  @Post()
  async create(@Body() dto: CreateLabResultDto) {
    const result = await this.service.createResult(dto);
    return { data: result };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.service.getResult(id);
    return { data: result };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLabResultDto) {
    const result = await this.service.updateResult(id, dto);
    return { data: result };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.deleteResult(id);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
@Controller('patients')
export class PatientLabResultsController {
  constructor(private readonly service: LabResultsService) {}

  @Get(':id/lab-results')
  async getByPatient(@Param('id') id: string) {
    const results = await this.service.getPatientLabResults(id);
    return { data: results };
  }
}
