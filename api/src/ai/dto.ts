import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const VALID_ROLES = ['system', 'user', 'assistant'] as const;

class ChatMessageDto {
  @IsIn(VALID_ROLES)
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  content!: string;
}

export class ChatCompletionDto {
  @IsString()
  provider!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @IsString()
  @IsOptional()
  pageContext?: string;
}
