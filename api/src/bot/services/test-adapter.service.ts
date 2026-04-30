import { Injectable } from '@nestjs/common';
import { BotAdapter, NormalizedMessage } from '../interfaces/bot-adapter.interface';

@Injectable()
export class TestAdapter implements BotAdapter {
  providerId = 'test';
  providerName = 'Test Adapter';

  parseWebhook(payload: unknown): NormalizedMessage {
    const p = payload as Record<string, unknown>;
    return {
      id: (p.id as string) || `test-${Date.now()}`,
      provider: this.providerId,
      eventType: (p.eventType as string) || 'message',
      senderId: (p.senderId as string) || 'test-sender',
      senderPhone: p.senderPhone as string | undefined,
      senderName: p.senderName as string | undefined,
      text: (p.text as string) || '',
      timestamp: new Date(),
      rawPayload: payload,
    };
  }

  async sendText(_recipientId: string, text: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[TestAdapter] Would send: ${text}`);
    return { success: true };
  }

  verifyWebhook(_req: unknown): boolean {
    return true;
  }
}
