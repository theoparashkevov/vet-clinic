import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { StaffAccess } from '../auth/staff-access.decorator';

@StaffAccess()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    const data = await this.analyticsService.getDashboardStats();
    return { data };
  }

  @Get('appointments')
  async getAppointmentsAnalytics(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    const data = await this.analyticsService.getAppointmentsAnalytics(daysNum);
    return { data };
  }

  @Get('patients/demographics')
  async getPatientDemographics() {
    const data = await this.analyticsService.getPatientDemographics();
    return { data };
  }
}