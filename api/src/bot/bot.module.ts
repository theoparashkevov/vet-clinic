import { Module } from '@nestjs/common';
import { BotWebhookController } from './bot-webhook.controller';
import { AdapterRegistryService } from './services/adapter-registry.service';
import { BotEngineService } from './services/bot-engine.service';
import { ConversationService } from './services/conversation.service';
import { TestAdapter } from './services/test-adapter.service';
import { ViberAdapter } from './adapters/viber.adapter';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [BotWebhookController],
  providers: [
    AdapterRegistryService,
    BotEngineService,
    ConversationService,
    TestAdapter,
    ViberAdapter,
    {
      provide: 'BOT_ADAPTER_INIT',
      useFactory: (registry: AdapterRegistryService, testAdapter: TestAdapter, viberAdapter: ViberAdapter) => {
        registry.register(testAdapter);
        registry.register(viberAdapter);
        return true;
      },
      inject: [AdapterRegistryService, TestAdapter, ViberAdapter],
    },
  ],
  exports: [AdapterRegistryService, BotEngineService, ConversationService],
})
export class BotModule {}
