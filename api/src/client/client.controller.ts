import { Controller, Get, Param, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('pets')
  async getMyPets(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.clientService.getPetsForClient(userId);
  }

  @Get('pets/:id')
  async getPetDetails(@Param('id') petId: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.clientService.getPetDetails(petId, userId);
  }

  @Get('appointments')
  async getMyAppointments(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.clientService.getAppointmentsForClient(userId);
  }

  @Post('appointment-requests')
  async requestAppointment(
    @Body() dto: { petId: string; preferredDate: string; reason: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return this.clientService.requestAppointment(userId, dto);
  }
}
