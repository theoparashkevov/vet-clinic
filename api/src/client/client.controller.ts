import { Controller, Get, Param, Post, Body, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard, AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('pets')
  async getMyPets(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.sub;
    return this.clientService.getPetsForClient(userId);
  }

  @Get('pets/:id')
  async getPetDetails(@Param('id') petId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user!.sub;
    return this.clientService.getPetDetails(petId, userId);
  }

  @Get('appointments')
  async getMyAppointments(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.sub;
    return this.clientService.getAppointmentsForClient(userId);
  }

  @Post('appointment-requests')
  async requestAppointment(
    @Body() dto: { petId: string; preferredDate: string; reason: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user!.sub;
    return this.clientService.requestAppointment(userId, dto);
  }
}
