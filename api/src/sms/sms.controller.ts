import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SMSService } from './sms.service';
import { StaffAccess } from '../auth/staff-access.decorator';

@StaffAccess()
@Controller('sms')
export class SMSController {
  constructor(private readonly smsService: SMSService) {}

  @Post('send-reminder/:reminderId')
  async sendReminder(@Param('reminderId') reminderId: string) {
    const success = await this.smsService.sendReminderSMS(reminderId);
    return { success };
  }

  @Post('send-appointment-confirmation/:appointmentId')
  async sendAppointmentConfirmation(@Param('appointmentId') appointmentId: string) {
    const success = await this.smsService.sendAppointmentConfirmation(appointmentId);
    return { success };
  }

  @Post('send-appointment-reminder/:appointmentId')
  async sendAppointmentReminder(@Param('appointmentId') appointmentId: string) {
    const success = await this.smsService.sendAppointmentReminder(appointmentId);
    return { success };
  }

  @Post('process-due-reminders')
  async processDueReminders() {
    const result = await this.smsService.processDueReminders();
    return result;
  }

  @Get('status')
  getStatus() {
    return {
      enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      provider: process.env.TWILIO_ACCOUNT_SID ? 'twilio' : 'console',
      fromNumber: process.env.TWILIO_FROM_NUMBER || null,
    };
  }
}
