import { Injectable } from '@nestjs/common';
import { AIProvider } from './interfaces';

@Injectable()
export class AIProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  get(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }
}
