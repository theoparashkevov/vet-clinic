export interface BotAdapter {
  providerId: string;
  providerName: string;

  parseWebhook(payload: unknown): NormalizedMessage;

  sendText(recipientId: string, text: string): Promise<{ success: boolean; error?: string }>;

  verifyWebhook(req: unknown): boolean;
}

export interface NormalizedMessage {
  id: string;
  provider: string;
  eventType: string;
  senderId: string;
  senderPhone?: string;
  senderName?: string;
  text?: string;
  timestamp: Date;
  rawPayload: unknown;
}

export interface BotResponse {
  text: string;
  buttons?: Array<{ label: string; action: string; data?: string }>;
  stateTransition?: string;
}

export interface ConversationState {
  provider: string;
  externalId: string;
  ownerId?: string;
  state: string;
  context: Record<string, unknown>;
}
