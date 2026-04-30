import { Injectable } from '@nestjs/common';
import { BotAdapter } from '../interfaces/bot-adapter.interface';

@Injectable()
export class AdapterRegistryService {
  private readonly adapters = new Map<string, BotAdapter>();

  register(adapter: BotAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  unregister(providerId: string): boolean {
    return this.adapters.delete(providerId);
  }

  get(providerId: string): BotAdapter | undefined {
    return this.adapters.get(providerId);
  }

  getAll(): BotAdapter[] {
    return Array.from(this.adapters.values());
  }

  has(providerId: string): boolean {
    return this.adapters.has(providerId);
  }
}
