import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || 'dev-settings-key-change-in-production';
  return scryptSync(secret, 'vet-clinic-salt', KEY_LENGTH);
}

function encryptValue(plainText: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `enc:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decryptValue(cipherText: string): string {
  if (!cipherText.startsWith('enc:')) {
    return cipherText;
  }
  const [, ivB64, authTagB64, encryptedB64] = cipherText.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

const DEFAULT_SETTINGS = [
  { key: 'clinic.name', value: 'Happy Paws Veterinary Clinic', type: 'string', category: 'clinic', isPublic: true, description: 'Clinic name' },
  { key: 'clinic.address', value: '', type: 'string', category: 'clinic', isPublic: true, description: 'Clinic address' },
  { key: 'clinic.phone', value: '', type: 'string', category: 'clinic', isPublic: true, description: 'Clinic phone' },
  { key: 'clinic.email', value: '', type: 'string', category: 'clinic', isPublic: true, description: 'Clinic email' },
  { key: 'clinic.timezone', value: 'UTC', type: 'string', category: 'clinic', isPublic: true, description: 'Clinic timezone' },
  { key: 'ai.defaultProvider', value: 'openai', type: 'string', category: 'ai', isPublic: true, description: 'Default AI provider' },
  { key: 'viber.enabled', value: 'false', type: 'boolean', category: 'viber', isPublic: true, description: 'Viber bot enabled' },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    for (const setting of DEFAULT_SETTINGS) {
      const exists = await this.prisma.platformSetting.findUnique({
        where: { key: setting.key },
        select: { id: true },
      });
      if (!exists) {
        await this.prisma.platformSetting.create({
          data: setting,
        });
      }
    }
  }

  private shouldEncrypt(setting: { isPublic: boolean; key: string }): boolean {
    return !setting.isPublic;
  }

  private maskIfSecret(setting: { isPublic: boolean; value: string }): string {
    if (setting.isPublic) {
      return setting.value;
    }
    return '***';
  }

  async getAll() {
    const settings = await this.prisma.platformSetting.findMany({
      orderBy: { category: 'asc' },
    });
    return settings.map((s) => ({
      ...s,
      value: this.maskIfSecret(s),
    }));
  }

  async getByKey(key: string) {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      return null;
    }
    return {
      ...setting,
      value: this.maskIfSecret(setting),
    };
  }

  async getDecryptedValue(key: string): Promise<string | null> {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key },
    });
    if (!setting) return null;
    return this.shouldEncrypt(setting) ? decryptValue(setting.value) : setting.value;
  }

  async update(key: string, value: string) {
    let setting = await this.prisma.platformSetting.findUnique({
      where: { key },
    });

    const data: any = { value };
    if (setting && this.shouldEncrypt(setting)) {
      data.value = encryptValue(value);
    }

    setting = await this.prisma.platformSetting.upsert({
      where: { key },
      update: data,
      create: {
        key,
        value: data.value || value,
        type: 'string',
      },
    });

    return {
      ...setting,
      value: this.maskIfSecret(setting),
    };
  }

  async updateBatch(settings: Record<string, string>) {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      const updated = await this.update(key, value);
      results.push(updated);
    }
    return results;
  }
}
