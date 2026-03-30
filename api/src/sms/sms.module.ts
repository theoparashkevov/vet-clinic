import { Module } from '@nestjs/common';
import { SMSProvider, TwilioProvider, ConsoleSMSProvider } from './sms.provider';
import { SMSService } from './sms.service';
import { SMSController } from './sms.controller';
import { PrismaModule } from '../prisma/prisma.module';

const smsProvider = {
  provide: SMSProvider,
  useFactory: () => {
    // Use Twilio if credentials are configured, otherwise fall back to console logging
    const hasTwilioCreds = process.env.TWILIO_ACCOUNT_SID && 
                           process.env.TWILIO_AUTH_TOKEN && 
                           process.env.TWILIO_FROM_NUMBER;
    
    if (hasTwilioCreds) {
      return new TwilioProvider();
    }
    
    console.log('[SMS] Using ConsoleSMSProvider - add TWILIO_* env vars for real SMS');
    return new ConsoleSMSProvider();
  },
};

@Module({
  imports: [PrismaModule],
  controllers: [SMSController],
  providers: [smsProvider, SMSService],
  exports: [SMSService, SMSProvider],
})
export class SMSModule {}
