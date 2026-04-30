import { Module, OnModuleInit } from '@nestjs/common';
import { BotWebhookController } from './bot-webhook.controller';
import { AdapterRegistryService } from './services/adapter-registry.service';
import { BotEngineService } from './services/bot-engine.service';
import { ConversationService } from './services/conversation.service';
import { TestAdapter } from './services/test-adapter.service';
import { ViberAdapter } from './adapters/viber.adapter';
import { SettingsModule } from '../settings/settings.module';
import {
  IdentityHandler,
  MenuHandler,
  AppointmentHandler,
  PatientHandler,
  ReminderHandler,
} from './handlers';

@Module({
  imports: [SettingsModule],
  controllers: [BotWebhookController],
  providers: [
    AdapterRegistryService,
    BotEngineService,
    ConversationService,
    TestAdapter,
    ViberAdapter,
    IdentityHandler,
    MenuHandler,
    AppointmentHandler,
    PatientHandler,
    ReminderHandler,
    {
      provide: 'BOT_ADAPTER_INIT',
      useFactory: (registry: AdapterRegistryService, testAdapter: TestAdapter, viberAdapter: ViberAdapter) => {
        registry.register(testAdapter);
        registry.register(viberAdapter);
        return true;
      },
      inject: [AdapterRegistryService, TestAdapter, ViberAdapter],
    },
    {
      provide: 'BOT_HANDLER_INIT',
      useFactory: (
        engine: BotEngineService,
        identity: IdentityHandler,
        appointment: AppointmentHandler,
        patient: PatientHandler,
        reminder: ReminderHandler,
        menu: MenuHandler,
      ) => {
        engine.registerHandler(identity);
        engine.registerHandler(appointment);
        engine.registerHandler(patient);
        engine.registerHandler(reminder);
        engine.registerHandler(menu);
        return true;
      },
      inject: [BotEngineService, IdentityHandler, AppointmentHandler, PatientHandler, ReminderHandler, MenuHandler],
    },
  ],
  exports: [AdapterRegistryService, BotEngineService, ConversationService],
})
export class BotModule implements OnModuleInit {
  constructor(
    private readonly engine: BotEngineService,
    private readonly identity: IdentityHandler,
    private readonly appointment: AppointmentHandler,
    private readonly patient: PatientHandler,
    private readonly reminder: ReminderHandler,
    private readonly menu: MenuHandler,
  ) {}

  onModuleInit() {
    this.engine.registerHandler(this.identity);
    this.engine.registerHandler(this.appointment);
    this.engine.registerHandler(this.patient);
    this.engine.registerHandler(this.reminder);
    this.engine.registerHandler(this.menu);
  }
}
