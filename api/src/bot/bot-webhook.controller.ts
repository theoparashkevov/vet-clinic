import { Controller, Post, Param, Body, BadRequestException, Req, Get } from '@nestjs/common';
import { Request } from 'express';
import { AdapterRegistryService } from './services/adapter-registry.service';
import { BotEngineService } from './services/bot-engine.service';
import { ViberAdapter } from './adapters/viber.adapter';

@Controller('bot/webhooks')
export class BotWebhookController {
  constructor(
    private readonly registry: AdapterRegistryService,
    private readonly engine: BotEngineService,
    private readonly viberAdapter: ViberAdapter,
  ) {}

  @Post(':provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: unknown,
    @Req() req: Request,
  ) {
    const adapter = this.registry.get(provider);
    if (!adapter) {
      throw new BadRequestException(`Unknown provider: ${provider}`);
    }

    if (!adapter.verifyWebhook(req)) {
      throw new BadRequestException('Webhook verification failed');
    }

    const message = adapter.parseWebhook(payload);
    await this.engine.process(message);

    return { ok: true };
  }

  @Post('viber/setup')
  async setupViberWebhook() {
    const result = await this.viberAdapter.setupWebhook(
      process.env.VIBER_WEBHOOK_URL || '',
    );
    if (!result.success) {
      throw new BadRequestException(result.error);
    }
    return { ok: true, message: 'Viber webhook configured successfully' };
  }
}
