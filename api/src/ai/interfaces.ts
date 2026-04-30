export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  provider: string;
  messages: ChatMessage[];
  pageContext?: string;
}

export interface ChatCompletionResponse {
  text: string;
  disclaimer: true;
  provider: string;
}

export interface AIProviderConfigMap {
  [key: string]: unknown;
}

export interface AIProvider {
  providerId: string;
  generateCompletion(
    messages: ChatMessage[],
    config: AIProviderConfigMap,
  ): Promise<string>;
  validateConfig(config: AIProviderConfigMap): boolean;
}
