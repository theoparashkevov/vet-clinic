import { Injectable, Logger } from '@nestjs/common';
import { SMSProvider } from './sms.provider';
import { PrismaService } from '../prisma/prisma.service';

export interface ReminderSMSTemplate {
  type: string;
  title: string;
  patientName: string;
  ownerName: string;
  clinicName: string;
  clinicPhone: string;
}

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  constructor(
    private readonly smsProvider: SMSProvider,
    private readonly prisma: PrismaService,
  ) {}

  async sendReminderSMS(reminderId: string): Promise<boolean> {
    try {
      const reminder = await this.prisma.followUpReminder.findUnique({
        where: { id: reminderId },
        include: {
          patient: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!reminder) {
        this.logger.warn(`Reminder ${reminderId} not found`);
        return false;
      }

      if (!reminder.notifyClient) {
        this.logger.log(`Reminder ${reminderId} does not have client notification enabled`);
        return false;
      }

      const phone = reminder.patient.owner.phone;
      if (!this.smsProvider.validatePhoneNumber(phone)) {
        this.logger.warn(`Invalid phone number for owner ${reminder.patient.owner.id}: ${phone}`);
        return false;
      }

      const message = this.buildReminderMessage({
        type: reminder.type,
        title: reminder.title,
        patientName: reminder.patient.name,
        ownerName: reminder.patient.owner.name,
        clinicName: process.env.CLINIC_NAME || 'Vet Clinic',
        clinicPhone: process.env.CLINIC_PHONE || '(555) 123-4567',
      });

      const result = await this.smsProvider.sendSMS({
        to: this.formatPhoneNumber(phone),
        body: message,
      });

      if (result.success) {
        await this.prisma.followUpReminder.update({
          where: { id: reminderId },
          data: { clientNotifiedAt: new Date() },
        });
        this.logger.log(`SMS sent successfully for reminder ${reminderId}`);
        return true;
      } else {
        this.logger.error(`Failed to send SMS for reminder ${reminderId}: ${result.error}`);
        return false;
      }
    } catch (error: any) {
      this.logger.error(`Error sending reminder SMS: ${error.message}`);
      return false;
    }
  }

  async sendAppointmentConfirmation(
    appointmentId: string,
  ): Promise<boolean> {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            include: {
              owner: true,
            },
          },
          doctor: true,
        },
      });

      if (!appointment) {
        this.logger.warn(`Appointment ${appointmentId} not found`);
        return false;
      }

      const phone = appointment.patient.owner.phone;
      if (!this.smsProvider.validatePhoneNumber(phone)) {
        return false;
      }

      const date = new Date(appointment.startsAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `Hi ${appointment.patient.owner.name}, this confirms ${appointment.patient.name}'s appointment on ${date}${appointment.doctor ? ` with Dr. ${appointment.doctor.name}` : ''}. Reply CANCEL to cancel or RESCHEDULE to change. ${process.env.CLINIC_NAME || 'Vet Clinic'}`;

      const result = await this.smsProvider.sendSMS({
        to: this.formatPhoneNumber(phone),
        body: message,
      });

      return result.success;
    } catch (error: any) {
      this.logger.error(`Error sending appointment confirmation: ${error.message}`);
      return false;
    }
  }

  async sendAppointmentReminder(
    appointmentId: string,
    hoursBefore: number = 24,
  ): Promise<boolean> {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!appointment) {
        return false;
      }

      const phone = appointment.patient.owner.phone;
      if (!this.smsProvider.validatePhoneNumber(phone)) {
        return false;
      }

      const date = new Date(appointment.startsAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `Reminder: ${appointment.patient.name} has an appointment tomorrow (${date}). Reply CONFIRM to confirm or CANCEL if you need to reschedule. ${process.env.CLINIC_NAME || 'Vet Clinic'}`;

      const result = await this.smsProvider.sendSMS({
        to: this.formatPhoneNumber(phone),
        body: message,
      });

      return result.success;
    } catch (error: any) {
      this.logger.error(`Error sending appointment reminder: ${error.message}`);
      return false;
    }
  }

  private buildReminderMessage(template: ReminderSMSTemplate): string {
    const typeMessages: Record<string, string> = {
      lab_results: `Hi ${template.ownerName}, the lab results for ${template.patientName} are ready. Please call ${template.clinicPhone} to discuss. ${template.clinicName}`,
      recheck: `Hi ${template.ownerName}, it's time to schedule a recheck for ${template.patientName}. Please call ${template.clinicPhone} or reply to book. ${template.clinicName}`,
      surgery_followup: `Hi ${template.ownerName}, this is a follow-up about ${template.patientName}'s recent surgery. How is the recovery going? Call ${template.clinicPhone} with any concerns. ${template.clinicName}`,
      medication: `Hi ${template.ownerName}, it's time to refill ${template.patientName}'s medication. Please call ${template.clinicPhone} or visit our website. ${template.clinicName}`,
      custom: `Hi ${template.ownerName}, ${template.title} for ${template.patientName}. Please call ${template.clinicPhone}. ${template.clinicName}`,
    };

    return typeMessages[template.type] || typeMessages.custom;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, assume US number and add +1
    if (!cleaned.startsWith('+')) {
      return `+1${cleaned}`;
    }
    
    return cleaned;
  }

  async processDueReminders(): Promise<{ processed: number; sent: number }> {
    const now = new Date();
    
    // Find reminders that are due and haven't been notified yet
    const dueReminders = await this.prisma.followUpReminder.findMany({
      where: {
        status: 'pending',
        notifyClient: true,
        clientNotifiedAt: null,
        dueDate: {
          lte: now,
        },
      },
    });

    let sent = 0;
    
    for (const reminder of dueReminders) {
      const success = await this.sendReminderSMS(reminder.id);
      if (success) sent++;
    }

    return { processed: dueReminders.length, sent };
  }
}
