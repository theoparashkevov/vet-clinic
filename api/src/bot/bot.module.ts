import { Module } from '@nestjs/common';
import { BotWebhookController } from './bot-webhook.controller';
import { AdapterRegistryService } from './services/adapter-registry.service';
import { BotEngineService } from './services/bot-engine.service';
import { ConversationService } from './services/conversation.service';
import { TestAdapter } from './services/test-adapter.service';

@Module({
  controllers: [BotWebhookController],
  providers: [
    AdapterRegistryService,
    BotEngineService,
    ConversationService,
    TestAdapter,
    {
      provide: 'BOT_ADAPTER_INIT',
      useFactory: (registry: AdapterRegistryService, testAdapter: TestAdapter) => {
        registry.register(testAdapter);
        return true;
      },
      inject: [AdapterRegistryService, TestAdapter],
    },
  ],
  exports: [AdapterRegistryService, BotEngineService, ConversationService],
})
export class BotModule {}
