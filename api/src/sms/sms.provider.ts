import { Injectable } from '@nestjs/common';

export interface SMSMessage {
  to: string;
  body: string;
}

export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export abstract class SMSProvider {
  abstract sendSMS(message: SMSMessage): Promise<SMSSendResult>;
  abstract validatePhoneNumber(phone: string): boolean;
}

@Injectable()
export class TwilioProvider extends SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private enabled: boolean;

  constructor() {
    super();
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
    this.enabled = !!(this.accountSid && this.authToken && this.fromNumber);
  }

  async sendSMS(message: SMSMessage): Promise<SMSSendResult> {
    if (!this.enabled) {
      console.log('[SMS MOCK] Would send SMS:', { to: message.to, body: message.body });
      return { success: true, messageId: 'mock-message-id' };
    }

    try {
      const twilio = require('twilio');
      const client = twilio(this.accountSid, this.authToken);

      const result = await client.messages.create({
        body: message.body,
        from: this.fromNumber,
        to: message.to,
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error: any) {
      console.error('Failed to send SMS via Twilio:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  validatePhoneNumber(phone: string): boolean {
    // Basic validation: must start with + and have at least 10 digits
    const cleaned = phone.replace(/\s+/g, '');
    return /^\+\d{10,15}$/.test(cleaned);
  }
}

@Injectable()
export class ConsoleSMSProvider extends SMSProvider {
  async sendSMS(message: SMSMessage): Promise<SMSSendResult> {
    console.log('═══════════════════════════════════════');
    console.log('📱 SMS NOTIFICATION');
    console.log('═══════════════════════════════════════');
    console.log(`To: ${message.to}`);
    console.log(`Body: ${message.body}`);
    console.log('═══════════════════════════════════════');
    
    return { success: true, messageId: `console-${Date.now()}` };
  }

  validatePhoneNumber(phone: string): boolean {
    return phone.length >= 10;
  }
}
